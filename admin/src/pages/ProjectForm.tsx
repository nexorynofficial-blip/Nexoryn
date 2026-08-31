import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ImageIcon } from "lucide-react";
import { api, ApiRequestError } from "../lib/api";
import type { Asset, Project } from "../types";
import { Button, Card, ErrorBanner, Field, Input, PageHeader, Select, Spinner, Textarea } from "../components/ui";
import { AssetPicker } from "../components/AssetPicker";
import { INDUSTRIES, SERVICES } from "../lib/constants";
import {
  DesignCaseStudyEditor,
  StandardCaseStudyEditor,
  emptyDesign,
  emptyStandard,
  fromRawCaseStudy,
  toRawCaseStudy,
  type DesignCaseStudy,
  type StandardCaseStudy,
} from "../components/CaseStudyEditor";

// Matches BASE_TABS / DESIGN_TABS in src/pages/CaseStudyPage.jsx exactly, so
// admins fill in the same sections visitors will see, in the same order.
const STANDARD_BASE_TABS = ["Overview", "Results", "Tech Stack", "Scalability & Flexibility"];
const DESIGN_TABS = ["Overview", "Design Process", "Key Features", "Use Cases", "Customization & Scalability", "Gallery"];

function extraTabName(kind: StandardCaseStudy["extraKind"]) {
  if (kind === "gallery") return "Gallery";
  if (kind === "screenshots") return "Screenshots";
  if (kind === "livePreview") return "Live Preview";
  return null;
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
  const [title, setTitle] = useState("");
  const [industry, setIndustry] = useState<string>(INDUSTRIES[0]);
  const [service, setService] = useState<(typeof SERVICES)[number]>(SERVICES[0]);
  const [description, setDescription] = useState("");
  const [tags, setTags] = useState("");
  const [photo, setPhoto] = useState<Asset | null>(null);
  const [isFeatured, setIsFeatured] = useState(false);
  const [featuredOrder, setFeaturedOrder] = useState<string>("");

  const isDesign = service === "Brand & Graphic Design";
  const [standard, setStandard] = useState<StandardCaseStudy>(emptyStandard());
  const [design, setDesign] = useState<DesignCaseStudy>(emptyDesign());

  const tabs = isDesign ? DESIGN_TABS : [...STANDARD_BASE_TABS, ...(extraTabName(standard.extraKind) ? [extraTabName(standard.extraKind)!] : [])];
  const [activeTab, setActiveTab] = useState(tabs[0]);

  useEffect(() => {
    // Keep the active tab valid when switching service or extra-content kind.
    if (!tabs.includes(activeTab)) setActiveTab(tabs[0]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isDesign, standard.extraKind]);

  useEffect(() => {
    if (isNew) {
      setLoading(false);
      return;
    }
    api
      .get<Project>(`/api/v1/admin/projects/${id}`)
      .then((p) => {
        setSlug(p.slug);
        setTitle(p.title);
        setIndustry(p.industry);
        setService(p.service);
        setDescription(p.description);
        setTags(p.tags.join(", "));
        setPhoto(p.photo);
        setIsFeatured(p.isFeatured);
        setFeaturedOrder(p.featuredOrder?.toString() ?? "");
        const parsed = fromRawCaseStudy(p.caseStudy);
        setStandard(parsed.standard);
        setDesign(parsed.design);
      })
      .catch((err) => setError(err instanceof ApiRequestError ? err.message : "Failed to load project"))
      .finally(() => setLoading(false));
  }, [id, isNew]);

  const handleSubmit = async () => {
    setError("");

    if (!photo) {
      setError("Choose a photo first.");
      return;
    }
    if (isDesign && design.gallery.length === 0) {
      setError("Design projects need at least one gallery image (Gallery tab).");
      return;
    }

    const caseStudy = toRawCaseStudy(isDesign, standard, design);

    const payload = {
      slug: slug.trim(),
      title: title.trim(),
      industry,
      service,
      description: description.trim(),
      tags: tags.split(",").map((t) => t.trim()).filter(Boolean),
      photoId: photo.id,
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
            <Input value={slug} onChange={(e) => setSlug(e.target.value)} placeholder="lowercase-with-hyphens" required />
          </Field>
          <Field label="Industry">
            <Select value={industry} onChange={(e) => setIndustry(e.target.value)}>
              {INDUSTRIES.map((i) => <option key={i} value={i}>{i}</option>)}
            </Select>
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
    </div>
  );
}
