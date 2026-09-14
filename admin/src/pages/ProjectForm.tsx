import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ImageIcon } from "lucide-react";
import { api, ApiRequestError } from "../lib/api";
import type { Asset, Project } from "../types";
import { Button, Card, ErrorBanner, Field, Input, PageHeader, Select, Spinner, Textarea } from "../components/ui";
import { AssetPicker } from "../components/AssetPicker";
import { MultiImageUploader, UNRESOLVED_MEDIA_PREFIX, galleryFromMediaItems, type MediaItem } from "../components/MultiImageUploader";
import { INDUSTRIES, SERVICES } from "../lib/constants";
import {
  DesignCaseStudyEditor,
  StandardCaseStudyEditor,
  emptyDesign,
  emptyStandard,
  fromRawCaseStudy,
  toRawCaseStudy,
  type DesignCaseStudy,
  type GalleryItem,
  type StandardCaseStudy,
} from "../components/CaseStudyEditor";
import FloatingAgentWidget, { type AutofillPayload } from "../components/FloatingAgentWidget";

// Matches BASE_TABS / DESIGN_TABS in src/pages/CaseStudyPage.jsx, minus the
// image-gallery tab each used to end with — that's now the Media section
// below (see MultiImageUploader), not a case-study tab, so the thumbnail and
// gallery are always the same set of images instead of two things an admin
// could accidentally let drift apart.
const STANDARD_TABS = ["Overview", "Results", "Tech Stack", "Scalability & Flexibility"];
const DESIGN_TABS = ["Overview", "Design Process", "Key Features", "Use Cases", "Customization & Scalability"];

function slugify(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/** Turns a saved gallery entry back into a MediaItem for the uploader.
 *  `asset` is either the project's real thumbnail Asset (for the entry that
 *  matches its URL) or, for every other entry, whatever `/assets/lookup-by-url`
 *  resolved it to — or a synthetic placeholder if it resolved to nothing (see
 *  MultiImageUploader's UNRESOLVED_MEDIA_PREFIX). */
function toMediaItem(gallery: GalleryItem, resolved: Asset | undefined): MediaItem {
  if (resolved) return { asset: resolved, alt: gallery.alt };
  return {
    asset: {
      id: `${UNRESOLVED_MEDIA_PREFIX}${gallery.src}`,
      url: gallery.src,
      altText: gallery.alt,
      width: gallery.width ?? null,
      height: gallery.height ?? null,
      mimeType: "",
      fileSize: 0,
      uploadedAt: "",
    },
    alt: gallery.alt,
  };
}

/** Rebuilds the unified media list for an existing Automation/Graphic Design
 *  project: the current thumbnail Asset (already real, from `project.photo`)
 *  plus every other gallery entry, resolved back to a real Asset where one
 *  still exists by URL. Only images added through this uploader are
 *  guaranteed to resolve — see MultiImageUploader's UNRESOLVED_MEDIA_PREFIX
 *  for what happens to older ones that predate it. */
async function hydrateMediaItems(thumbnail: Asset, gallery: GalleryItem[]): Promise<MediaItem[]> {
  const otherUrls = gallery.map((g) => g.src).filter((src) => src !== thumbnail.url);

  let resolvedByUrl = new Map<string, Asset>();
  if (otherUrls.length > 0) {
    try {
      const res = await api.post<{ items: Asset[] }>("/api/v1/admin/assets/lookup-by-url", {
        urls: otherUrls,
      });
      resolvedByUrl = new Map(res.items.map((a) => [a.url, a]));
    } catch {
      // Best effort — anything unresolved just falls back to a placeholder
      // below instead of blocking the form from loading at all.
    }
  }

  const thumbnailGalleryEntry = gallery.find((g) => g.src === thumbnail.url);
  const items: MediaItem[] = [
    { asset: thumbnail, alt: thumbnailGalleryEntry?.alt ?? thumbnail.altText },
  ];
  for (const g of gallery) {
    if (g.src === thumbnail.url) continue; // already added as the thumbnail entry above
    items.push(toMediaItem(g, resolvedByUrl.get(g.src)));
  }
  return items;
}

export default function ProjectForm() {
  const { id } = useParams();
  const isNew = !id || id === "new";
  const navigate = useNavigate();

  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [pickerOpen, setPickerOpen] = useState(false);

  const [slug, setSlug] = useState("");
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(!isNew);
  const [title, setTitle] = useState("");
  const [industry, setIndustry] = useState("");
  const [service, setService] = useState<(typeof SERVICES)[number]>(SERVICES[0]);
  const [description, setDescription] = useState("");
  const [tags, setTags] = useState("");
  const [isFeatured, setIsFeatured] = useState(false);
  const [featuredOrder, setFeaturedOrder] = useState<string>("");

  // Web Development: one thumbnail photo, no gallery.
  const [photo, setPhoto] = useState<Asset | null>(null);
  // Automation / Brand & Graphic Design: every image lives here as one list;
  // `thumbnailId` picks which of them is also Project.photoId. See
  // MultiImageUploader's doc comment for why these two are never separate.
  const [mediaItems, setMediaItems] = useState<MediaItem[]>([]);
  const [thumbnailId, setThumbnailId] = useState<string | null>(null);

  const isDesign = service === "Brand & Graphic Design";
  const [standard, setStandard] = useState<StandardCaseStudy>(emptyStandard());
  const [design, setDesign] = useState<DesignCaseStudy>(emptyDesign());

  const tabs = isDesign ? DESIGN_TABS : STANDARD_TABS;
  const [activeTab, setActiveTab] = useState(tabs[0]);

  useEffect(() => {
    // Keep the active tab valid when switching service.
    if (!tabs.includes(activeTab)) setActiveTab(tabs[0]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isDesign]);

  // Auto-fills the slug from the title for a brand-new project, right up
  // until the admin edits the slug field directly — after that it's treated
  // as deliberately chosen and left alone. Never runs for an existing
  // project: its slug is already a live URL, so a title tweak shouldn't move it.
  useEffect(() => {
    if (isNew && !slugManuallyEdited) setSlug(slugify(title));
  }, [title, isNew, slugManuallyEdited]);

  // Lets service changes carry the already-chosen image(s) across instead of
  // silently discarding them — e.g. picking "Web Development" by mistake
  // after already adding gallery images doesn't lose them, and switching back
  // restores the same photo as the thumbnail. Skipped on the initial load
  // (hasLoadedRef) so hydrating an existing project doesn't trigger it.
  const hasLoadedRef = useRef(false);
  const prevServiceRef = useRef(service);
  useEffect(() => {
    if (!hasLoadedRef.current || prevServiceRef.current === service) {
      prevServiceRef.current = service;
      return;
    }
    const wasWebDev = prevServiceRef.current === "Web Development";
    const isWebDev = service === "Web Development";
    if (isWebDev && !wasWebDev) {
      const current = mediaItems.find((m) => m.asset.id === thumbnailId)?.asset ?? null;
      setPhoto(current);
      setMediaItems([]);
      setThumbnailId(null);
    } else if (!isWebDev && wasWebDev && photo) {
      setMediaItems([{ asset: photo, alt: photo.altText }]);
      setThumbnailId(photo.id);
      setPhoto(null);
    }
    prevServiceRef.current = service;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [service]);

  const handleAutofill = (data: AutofillPayload) => {
    setService(data.service);
    setTitle(data.title);
    setIndustry(data.industry);
    setDescription(data.description);
    setTags(data.tags.join(", "));

    const parsed = fromRawCaseStudy(data.caseStudy);
    setStandard(parsed.standard);
    setDesign(parsed.design);
  };

  useEffect(() => {
    if (isNew) {
      setLoading(false);
      hasLoadedRef.current = true;
      return;
    }
    api
      .get<Project>(`/api/v1/admin/projects/${id}`)
      .then(async (p) => {
        setSlug(p.slug);
        setTitle(p.title);
        setIndustry(p.industry);
        setService(p.service);
        setDescription(p.description);
        setTags(p.tags.join(", "));
        setIsFeatured(p.isFeatured);
        setFeaturedOrder(p.featuredOrder?.toString() ?? "");
        const parsed = fromRawCaseStudy(p.caseStudy);
        setStandard(parsed.standard);
        setDesign(parsed.design);

        if (p.service === "Web Development") {
          setPhoto(p.photo);
        } else {
          // Automation historically stored its images under `screenshots`
          // rather than `gallery` (see fromRawCaseStudy) — fall back to
          // that so an older project's images still load for editing.
          const gallery = p.service === "Brand & Graphic Design"
            ? parsed.design.gallery
            : parsed.standard.gallery.length
              ? parsed.standard.gallery
              : parsed.standard.screenshots;
          const items = await hydrateMediaItems(p.photo, gallery);
          setMediaItems(items);
          setThumbnailId(p.photo.id);
        }
      })
      .catch((err) => setError(err instanceof ApiRequestError ? err.message : "Failed to load project"))
      .finally(() => {
        setLoading(false);
        hasLoadedRef.current = true;
      });
  }, [id, isNew]);

  const handleSubmit = async () => {
    setError("");

    if (!industry.trim()) {
      setError("Enter an industry.");
      return;
    }

    let photoId: string;
    let caseStudy: Record<string, unknown>;

    if (service === "Web Development") {
      if (!photo) {
        setError("Choose a photo first.");
        return;
      }
      photoId = photo.id;
      const withLivePreview: StandardCaseStudy = {
        ...standard,
        extraKind: "livePreview",
        gallery: [],
        screenshots: [],
      };
      caseStudy = toRawCaseStudy(false, withLivePreview, design);
    } else {
      if (mediaItems.length === 0 || !thumbnailId) {
        setError("Add at least one photo and choose a thumbnail.");
        return;
      }
      photoId = thumbnailId;
      const gallery = galleryFromMediaItems(mediaItems);
      if (isDesign) {
        caseStudy = toRawCaseStudy(true, standard, { ...design, gallery });
      } else {
        const withGallery: StandardCaseStudy = {
          ...standard,
          extraKind: "gallery",
          gallery,
          screenshots: [],
          livePreviewUrl: "",
        };
        caseStudy = toRawCaseStudy(false, withGallery, design);
      }
    }

    const payload = {
      slug: slug.trim(),
      title: title.trim(),
      industry: industry.trim(),
      service,
      description: description.trim(),
      tags: tags.split(",").map((t) => t.trim()).filter(Boolean),
      photoId,
      caseStudy,
      isFeatured,
      featuredOrder: featuredOrder ? Number(featuredOrder) : undefined,
    };

    setSaving(true);
    try {
      if (isNew) {
        await api.post("/api/v1/admin/projects", payload);
      } else {
        await api.put(`/api/v1/admin/projects/${id}`, payload);
      }
      navigate("/projects");
    } catch (err) {
      if (err instanceof ApiRequestError && err.fields) {
        setError(`${err.message}: ${Object.entries(err.fields).map(([k, v]) => `${k} — ${v}`).join("; ")}`);
      } else {
        setError(err instanceof ApiRequestError ? err.message : "Save failed");
      }
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <Spinner />;

  return (
    <div className="max-w-4xl">
      <PageHeader title={isNew ? "New Project" : `Edit: ${title}`} />
      <ErrorBanner message={error} />

      <Card className="flex flex-col gap-5 p-6">
        <div className="grid grid-cols-2 gap-4">
          <Field label="Title">
            <Input value={title} onChange={(e) => setTitle(e.target.value)} required />
          </Field>
          <Field label="Slug">
            <div className="flex items-center gap-2">
              <Input
                value={slug}
                onChange={(e) => {
                  setSlug(e.target.value);
                  setSlugManuallyEdited(true);
                }}
                placeholder="lowercase-with-hyphens"
                className="flex-1"
                required
              />
              <button
                type="button"
                onClick={() => {
                  setSlug(slugify(title));
                  setSlugManuallyEdited(false);
                }}
                title="Regenerate from title"
                className="shrink-0 whitespace-nowrap text-[11px] text-white/40 transition hover:text-white"
              >
                From title
              </button>
            </div>
            <p className="mt-1 text-[11px] text-white/30">
              This project's page address: nexoryn.ai/portfolio/{slug || "…"}
            </p>
          </Field>
          <Field label="Industry">
            <Input
              value={industry}
              onChange={(e) => setIndustry(e.target.value)}
              placeholder="e.g. Fintech"
              list="industry-suggestions"
              required
            />
            <datalist id="industry-suggestions">
              {INDUSTRIES.map((i) => (
                <option key={i} value={i} />
              ))}
            </datalist>
          </Field>
          <Field label="Service">
            <Select value={service} onChange={(e) => setService(e.target.value as typeof service)}>
              {SERVICES.map((s) => <option key={s} value={s}>{s}</option>)}
            </Select>
          </Field>
        </div>

        <Field label="Description (card summary)">
          <Textarea value={description} onChange={(e) => setDescription(e.target.value)} className="min-h-[70px] font-sans text-sm" />
        </Field>

        <Field label="Tags (comma-separated)">
          <Input value={tags} onChange={(e) => setTags(e.target.value)} placeholder="Automation, n8n, Ollama" />
        </Field>

        {service === "Web Development" ? (
          <div className="flex flex-col gap-5">
            <Field label="Photo">
              <div className="flex items-center gap-3">
                {photo ? (
                  <img src={photo.url} alt={photo.altText} className="h-16 w-16 rounded-lg object-cover" onError={(e) => (e.currentTarget.style.opacity = "0.15")} />
                ) : (
                  <div className="flex h-16 w-16 items-center justify-center rounded-lg border border-dashed border-white/15 text-white/20">
                    <ImageIcon className="h-5 w-5" />
                  </div>
                )}
                <Button type="button" variant="secondary" onClick={() => setPickerOpen(true)}>
                  {photo ? "Change photo" : "Choose photo"}
                </Button>
              </div>
            </Field>
            <Field label="Live preview URL (leave blank for 'coming soon')">
              <Input
                value={standard.livePreviewUrl}
                onChange={(e) => setStandard({ ...standard, livePreviewUrl: e.target.value })}
                placeholder="https://..."
              />
            </Field>
          </div>
        ) : (
          <Field label="Photos">
            <p className="mb-2 -mt-1 text-[11px] text-white/30">
              Add every image for this project. Pick one as the thumbnail — every image here,
              including the thumbnail, shows in the case study's Gallery tab.
            </p>
            <MultiImageUploader
              items={mediaItems}
              thumbnailId={thumbnailId}
              onChange={(items, tid) => {
                setMediaItems(items);
                setThumbnailId(tid);
              }}
            />
          </Field>
        )}

        <div className="flex items-center gap-6">
          <label className="flex items-center gap-2 text-sm text-white/70">
            <input type="checkbox" checked={isFeatured} onChange={(e) => setIsFeatured(e.target.checked)} />
            Featured on homepage
          </label>
          {isFeatured && (
            <Field label="Featured order">
              <Input type="number" value={featuredOrder} onChange={(e) => setFeaturedOrder(e.target.value)} className="w-24" />
            </Field>
          )}
        </div>

        <div>
          <div className="mb-1 flex items-center justify-between">
            <span className="text-xs font-medium uppercase tracking-wide text-white/50">Case Study</span>
          </div>
          <p className="mb-3 text-xs text-white/40">
            These tabs match exactly what visitors see on the case study page for a {isDesign ? "design" : "automation/web development"} project.
          </p>

          <div className="mb-4 flex flex-wrap gap-1 rounded-lg border border-white/10 bg-black/20 p-1">
            {tabs.map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setActiveTab(t)}
                className={`rounded-md px-3 py-1.5 text-xs font-medium transition ${
                  activeTab === t ? "bg-accent-from/20 text-accent-to" : "text-white/50 hover:text-white"
                }`}
              >
                {t}
              </button>
            ))}
          </div>

          {isDesign ? (
            <DesignCaseStudyEditor value={design} onChange={setDesign} activeTab={activeTab} />
          ) : (
            <StandardCaseStudyEditor value={standard} onChange={setStandard} activeTab={activeTab} />
          )}
        </div>

        <div className="flex justify-end gap-3">
          <Button variant="secondary" onClick={() => navigate("/projects")}>Cancel</Button>
          <Button onClick={handleSubmit} loading={saving}>Save Project</Button>
        </div>
      </Card>

      {pickerOpen && (
        <AssetPicker
          onSelect={(asset) => {
            setPhoto(asset);
            setPickerOpen(false);
          }}
          onClose={() => setPickerOpen(false)}
        />
      )}

      <FloatingAgentWidget
        backendApiBaseUrl={import.meta.env.VITE_NEXORYN_AGENT_URL}
        onAutofill={handleAutofill}
      />
    </div>
  );
}
