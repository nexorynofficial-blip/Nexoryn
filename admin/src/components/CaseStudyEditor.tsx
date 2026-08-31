// Structured, tabbed case-study editor — mirrors the exact tab layout the
// public site renders (see BASE_TABS/DESIGN_TABS in src/pages/CaseStudyPage.jsx)
// so admins fill in content that matches what visitors will actually see,
// without ever touching raw JSON.
import { useState } from "react";
import { ImageIcon, Plus, Trash2 } from "lucide-react";
import type { Asset } from "../types";
import { Button, Field, Input, Select, Textarea } from "./ui";
import { AssetPicker } from "./AssetPicker";

export type TitledItem = { title: string; description: string };
export type WorkflowItem = { icon: string; label: string };
export type TechStackItem = { name: string; role: string; icon: string };
export type GalleryItem = { src: string; alt: string; width?: number; height?: number };
export type ExtraKind = "none" | "gallery" | "screenshots" | "livePreview";

export interface StandardCaseStudy {
  category: string;
  techIcons: { name: string; icon: string }[];
  summary: string;
  overview: {
    problem: string[];
    solution: string[];
    workflow: WorkflowItem[];
    breakdown: TitledItem[];
  };
  results: { keyFeatures: TitledItem[]; before: string; after: string; proof: string };
  techStack: Record<string, TechStackItem[]>;
  scalability: TitledItem[];
  extraKind: ExtraKind;
  gallery: GalleryItem[];
  screenshots: GalleryItem[];
  livePreviewUrl: string;
}

export interface DesignCaseStudy {
  category: string;
  techIcons: { name: string; icon: string }[];
  summary: string;
  overview: { problem: string[]; solution: string[] };
  designProcess: { input: string[]; workflow: WorkflowItem[]; engine: string; refinements: string; qa: string };
  keyFeatures: TitledItem[];
  useCases: TitledItem[];
  scalability: TitledItem[];
  gallery: GalleryItem[];
}

export function emptyStandard(): StandardCaseStudy {
  return {
    category: "",
    techIcons: [],
    summary: "",
    overview: { problem: [], solution: [], workflow: [], breakdown: [] },
    results: { keyFeatures: [], before: "", after: "", proof: "" },
    techStack: {},
    scalability: [],
    extraKind: "none",
    gallery: [],
    screenshots: [],
    livePreviewUrl: "",
  };
}

export function emptyDesign(): DesignCaseStudy {
  return {
    category: "Brand & Graphic Design",
    techIcons: [],
    summary: "",
    overview: { problem: [], solution: [] },
    designProcess: { input: [], workflow: [], engine: "", refinements: "", qa: "" },
    keyFeatures: [],
    useCases: [],
    scalability: [],
    gallery: [],
  };
}

/** Converts a saved raw caseStudy JSON blob (from the API) into editor state. */
export function fromRawCaseStudy(raw: Record<string, unknown>): { isDesign: boolean; standard: StandardCaseStudy; design: DesignCaseStudy } {
  const isDesign = "designProcess" in raw;
  if (isDesign) {
    const r = raw as Partial<DesignCaseStudy>;
    return {
      isDesign,
      standard: emptyStandard(),
      design: {
        category: r.category ?? "",
        techIcons: r.techIcons ?? [],
        summary: r.summary ?? "",
        overview: { problem: r.overview?.problem ?? [], solution: r.overview?.solution ?? [] },
        designProcess: {
          input: r.designProcess?.input ?? [],
          workflow: r.designProcess?.workflow ?? [],
          engine: r.designProcess?.engine ?? "",
          refinements: r.designProcess?.refinements ?? "",
          qa: r.designProcess?.qa ?? "",
        },
        keyFeatures: r.keyFeatures ?? [],
        useCases: r.useCases ?? [],
        scalability: r.scalability ?? [],
        gallery: r.gallery ?? [],
      },
    };
  }
  const r = raw as Partial<StandardCaseStudy> & { livePreview?: string | true };
  let extraKind: ExtraKind = "none";
  if (r.gallery?.length) extraKind = "gallery";
  else if (r.screenshots?.length) extraKind = "screenshots";
  else if (r.livePreview) extraKind = "livePreview";
  return {
    isDesign,
    design: emptyDesign(),
    standard: {
      category: r.category ?? "",
      techIcons: r.techIcons ?? [],
      summary: r.summary ?? "",
      overview: {
        problem: r.overview?.problem ?? [],
        solution: r.overview?.solution ?? [],
        workflow: r.overview?.workflow ?? [],
        breakdown: r.overview?.breakdown ?? [],
      },
      results: {
        keyFeatures: r.results?.keyFeatures ?? [],
        before: r.results?.before ?? "",
        after: r.results?.after ?? "",
        proof: r.results?.proof ?? "",
      },
      techStack: r.techStack ?? {},
      scalability: r.scalability ?? [],
      extraKind,
      gallery: r.gallery ?? [],
      screenshots: r.screenshots ?? [],
      livePreviewUrl: typeof r.livePreview === "string" ? r.livePreview : "",
    },
  };
}

/** Converts editor state back into the exact JSON shape the API/site expect. */
export function toRawCaseStudy(isDesign: boolean, standard: StandardCaseStudy, design: DesignCaseStudy): Record<string, unknown> {
  if (isDesign) {
    return {
      category: design.category,
      techIcons: design.techIcons,
      summary: design.summary,
      overview: design.overview,
      designProcess: design.designProcess,
      keyFeatures: design.keyFeatures,
      useCases: design.useCases,
      scalability: design.scalability,
      gallery: design.gallery,
    };
  }
  const base: Record<string, unknown> = {
    category: standard.category,
    techIcons: standard.techIcons,
    summary: standard.summary,
    overview: standard.overview,
    results: standard.results,
    techStack: standard.techStack,
    scalability: standard.scalability,
  };
  if (standard.extraKind === "gallery") base.gallery = standard.gallery;
  else if (standard.extraKind === "screenshots") base.screenshots = standard.screenshots;
  else if (standard.extraKind === "livePreview") base.livePreview = standard.livePreviewUrl || true;
  return base;
}

/* ── Small reusable list editors ─────────────────────────────────────── */

function SectionLabel({ children, hint }: { children: string; hint?: string }) {
  return (
    <div className="mb-2">
      <span className="text-xs font-medium uppercase tracking-wide text-white/50">{children}</span>
      {hint && <p className="text-[11px] text-white/30">{hint}</p>}
    </div>
  );
}

function AddRemoveRow({ onRemove }: { onRemove: () => void }) {
  return (
    <button type="button" onClick={onRemove} className="shrink-0 text-white/30 hover:text-red-400">
      <Trash2 className="h-4 w-4" />
    </button>
  );
}

export function StringListEditor({ label, hint, values, onChange }: { label: string; hint?: string; values: string[]; onChange: (v: string[]) => void }) {
  return (
    <div>
      <SectionLabel hint={hint}>{label}</SectionLabel>
      <div className="flex flex-col gap-2">
        {values.map((v, i) => (
          <div key={i} className="flex items-center gap-2">
            <Input value={v} onChange={(e) => onChange(values.map((x, j) => (j === i ? e.target.value : x)))} className="flex-1" />
            <AddRemoveRow onRemove={() => onChange(values.filter((_, j) => j !== i))} />
          </div>
        ))}
        <Button type="button" variant="ghost" onClick={() => onChange([...values, ""])} className="self-start">
          <Plus className="h-3.5 w-3.5" /> Add
        </Button>
      </div>
    </div>
  );
}

export function TitledListEditor({ label, hint, values, onChange }: { label: string; hint?: string; values: TitledItem[]; onChange: (v: TitledItem[]) => void }) {
  return (
    <div>
      <SectionLabel hint={hint}>{label}</SectionLabel>
      <div className="flex flex-col gap-3">
        {values.map((v, i) => (
          <div key={i} className="flex items-start gap-2 rounded-lg border border-white/10 p-3">
            <div className="flex-1 space-y-2">
              <Input placeholder="Title" value={v.title} onChange={(e) => onChange(values.map((x, j) => (j === i ? { ...x, title: e.target.value } : x)))} />
              <Textarea placeholder="Description" value={v.description} className="min-h-[60px] font-sans text-sm" onChange={(e) => onChange(values.map((x, j) => (j === i ? { ...x, description: e.target.value } : x)))} />
            </div>
            <AddRemoveRow onRemove={() => onChange(values.filter((_, j) => j !== i))} />
          </div>
        ))}
        <Button type="button" variant="ghost" onClick={() => onChange([...values, { title: "", description: "" }])} className="self-start">
          <Plus className="h-3.5 w-3.5" /> Add
        </Button>
      </div>
    </div>
  );
}

export function WorkflowListEditor({ label, hint, values, onChange }: { label: string; hint?: string; values: WorkflowItem[]; onChange: (v: WorkflowItem[]) => void }) {
  return (
    <div>
      <SectionLabel hint={hint ?? "Icon = a lucide-react icon name, e.g. MessageSquare"}>{label}</SectionLabel>
      <div className="flex flex-col gap-2">
        {values.map((v, i) => (
          <div key={i} className="flex items-center gap-2">
            <Input placeholder="Icon name" value={v.icon} onChange={(e) => onChange(values.map((x, j) => (j === i ? { ...x, icon: e.target.value } : x)))} className="w-40" />
            <Input placeholder="Step label" value={v.label} onChange={(e) => onChange(values.map((x, j) => (j === i ? { ...x, label: e.target.value } : x)))} className="flex-1" />
            <AddRemoveRow onRemove={() => onChange(values.filter((_, j) => j !== i))} />
          </div>
        ))}
        <Button type="button" variant="ghost" onClick={() => onChange([...values, { icon: "", label: "" }])} className="self-start">
          <Plus className="h-3.5 w-3.5" /> Add step
        </Button>
      </div>
    </div>
  );
}

export function TechIconsEditor({ values, onChange }: { values: { name: string; icon: string }[]; onChange: (v: { name: string; icon: string }[]) => void }) {
  return (
    <div>
      <SectionLabel hint="Small icon badges shown at the top of the case study">Tech icons</SectionLabel>
      <div className="flex flex-col gap-2">
        {values.map((v, i) => (
          <div key={i} className="flex items-center gap-2">
            <Input placeholder="Name (e.g. n8n)" value={v.name} onChange={(e) => onChange(values.map((x, j) => (j === i ? { ...x, name: e.target.value } : x)))} className="flex-1" />
            <Input placeholder="Icon name (e.g. Workflow)" value={v.icon} onChange={(e) => onChange(values.map((x, j) => (j === i ? { ...x, icon: e.target.value } : x)))} className="flex-1" />
            <AddRemoveRow onRemove={() => onChange(values.filter((_, j) => j !== i))} />
          </div>
        ))}
        <Button type="button" variant="ghost" onClick={() => onChange([...values, { name: "", icon: "" }])} className="self-start">
          <Plus className="h-3.5 w-3.5" /> Add icon
        </Button>
      </div>
    </div>
  );
}

export function TechStackEditor({ value, onChange }: { value: Record<string, TechStackItem[]>; onChange: (v: Record<string, TechStackItem[]>) => void }) {
  const groups = Object.entries(value);
  const setGroup = (groupName: string, items: TechStackItem[]) => onChange({ ...value, [groupName]: items });
  const renameGroup = (oldName: string, newName: string) => {
    if (!newName || newName === oldName) return;
    const next = { ...value };
    next[newName] = next[oldName];
    delete next[oldName];
    onChange(next);
  };
  const removeGroup = (groupName: string) => {
    const next = { ...value };
    delete next[groupName];
    onChange(next);
  };

  return (
    <div>
      <SectionLabel hint="Grouped by category (e.g. 'Automation', 'Frontend') — matches the site's Tech Stack tab">Tech stack</SectionLabel>
      <div className="flex flex-col gap-4">
        {groups.map(([groupName, items]) => (
          <div key={groupName} className="rounded-lg border border-white/10 p-3">
            <div className="mb-2 flex items-center gap-2">
              <Input defaultValue={groupName} onBlur={(e) => renameGroup(groupName, e.target.value.trim())} placeholder="Group name" className="flex-1 font-semibold" />
              <AddRemoveRow onRemove={() => removeGroup(groupName)} />
            </div>
            <div className="flex flex-col gap-2">
              {items.map((it, i) => (
                <div key={i} className="flex items-center gap-2">
                  <Input placeholder="Name" value={it.name} onChange={(e) => setGroup(groupName, items.map((x, j) => (j === i ? { ...x, name: e.target.value } : x)))} className="flex-1" />
                  <Input placeholder="Role" value={it.role} onChange={(e) => setGroup(groupName, items.map((x, j) => (j === i ? { ...x, role: e.target.value } : x)))} className="flex-1" />
                  <Input placeholder="Icon" value={it.icon} onChange={(e) => setGroup(groupName, items.map((x, j) => (j === i ? { ...x, icon: e.target.value } : x)))} className="w-32" />
                  <AddRemoveRow onRemove={() => setGroup(groupName, items.filter((_, j) => j !== i))} />
                </div>
              ))}
              <Button type="button" variant="ghost" onClick={() => setGroup(groupName, [...items, { name: "", role: "", icon: "" }])} className="self-start">
                <Plus className="h-3.5 w-3.5" /> Add item
              </Button>
            </div>
          </div>
        ))}
        <Button type="button" variant="secondary" onClick={() => onChange({ ...value, [`Group ${groups.length + 1}`]: [] })} className="self-start">
          <Plus className="h-3.5 w-3.5" /> Add group
        </Button>
      </div>
    </div>
  );
}

export function GalleryEditor({ label, values, onChange }: { label: string; values: GalleryItem[]; onChange: (v: GalleryItem[]) => void }) {
  const [pickerIndex, setPickerIndex] = useState<number | null>(null);

  const applyAsset = (asset: Asset) => {
    if (pickerIndex === null) return;
    onChange(
      values.map((x, j) =>
        j === pickerIndex ? { ...x, src: asset.url, alt: x.alt || asset.altText, width: asset.width ?? x.width, height: asset.height ?? x.height } : x,
      ),
    );
    setPickerIndex(null);
  };

  return (
    <div>
      <SectionLabel>{label}</SectionLabel>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {values.map((v, i) => (
          <div key={i} className="flex gap-3 rounded-lg border border-white/10 p-3">
            {v.src ? (
              <img src={v.src} alt={v.alt} className="h-16 w-16 shrink-0 rounded-lg object-cover" onError={(e) => (e.currentTarget.style.opacity = "0.15")} />
            ) : (
              <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-lg border border-dashed border-white/15 text-white/20">
                <ImageIcon className="h-5 w-5" />
              </div>
            )}
            <div className="flex-1 space-y-2">
              <Button type="button" variant="ghost" onClick={() => setPickerIndex(i)}>{v.src ? "Change image" : "Choose image"}</Button>
              <Input placeholder="Alt text" value={v.alt} onChange={(e) => onChange(values.map((x, j) => (j === i ? { ...x, alt: e.target.value } : x)))} />
            </div>
            <AddRemoveRow onRemove={() => onChange(values.filter((_, j) => j !== i))} />
          </div>
        ))}
      </div>
      <Button type="button" variant="ghost" onClick={() => onChange([...values, { src: "", alt: "" }])} className="mt-3">
        <Plus className="h-3.5 w-3.5" /> Add image
      </Button>
      {pickerIndex !== null && <AssetPicker onSelect={applyAsset} onClose={() => setPickerIndex(null)} />}
    </div>
  );
}

/* ── Full editor: standard shape (Automation / Web Development) ─────── */

export function StandardCaseStudyEditor({ value, onChange, activeTab }: { value: StandardCaseStudy; onChange: (v: StandardCaseStudy) => void; activeTab: string }) {
  if (activeTab === "Overview") {
    return (
      <div className="flex flex-col gap-5">
        <Field label="Category (small label at the top of the page)">
          <Input value={value.category} onChange={(e) => onChange({ ...value, category: e.target.value })} />
        </Field>
        <Field label="Summary">
          <Textarea value={value.summary} className="min-h-[70px] font-sans text-sm" onChange={(e) => onChange({ ...value, summary: e.target.value })} />
        </Field>
        <TechIconsEditor values={value.techIcons} onChange={(techIcons) => onChange({ ...value, techIcons })} />
        <StringListEditor label="The problem" values={value.overview.problem} onChange={(problem) => onChange({ ...value, overview: { ...value.overview, problem } })} />
        <StringListEditor label="The solution" values={value.overview.solution} onChange={(solution) => onChange({ ...value, overview: { ...value.overview, solution } })} />
        <WorkflowListEditor label="Workflow steps" values={value.overview.workflow} onChange={(workflow) => onChange({ ...value, overview: { ...value.overview, workflow } })} />
        <TitledListEditor label="Technical breakdown" values={value.overview.breakdown} onChange={(breakdown) => onChange({ ...value, overview: { ...value.overview, breakdown } })} />
      </div>
    );
  }
  if (activeTab === "Results") {
    return (
      <div className="flex flex-col gap-5">
        <TitledListEditor label="Key features" values={value.results.keyFeatures} onChange={(keyFeatures) => onChange({ ...value, results: { ...value.results, keyFeatures } })} />
        <Field label="Before"><Textarea value={value.results.before} className="min-h-[60px] font-sans text-sm" onChange={(e) => onChange({ ...value, results: { ...value.results, before: e.target.value } })} /></Field>
        <Field label="After"><Textarea value={value.results.after} className="min-h-[60px] font-sans text-sm" onChange={(e) => onChange({ ...value, results: { ...value.results, after: e.target.value } })} /></Field>
        <Field label="Proof / why it matters"><Textarea value={value.results.proof} className="min-h-[60px] font-sans text-sm" onChange={(e) => onChange({ ...value, results: { ...value.results, proof: e.target.value } })} /></Field>
      </div>
    );
  }
  if (activeTab === "Tech Stack") {
    return <TechStackEditor value={value.techStack} onChange={(techStack) => onChange({ ...value, techStack })} />;
  }
  if (activeTab === "Scalability & Flexibility") {
    return <TitledListEditor label="Scalability & flexibility" values={value.scalability} onChange={(scalability) => onChange({ ...value, scalability })} />;
  }
  // The final, variable tab — Gallery / Screenshots / Live Preview / none.
  return (
    <div className="flex flex-col gap-5">
      <Field label="Extra content (this project's final tab)">
        <Select value={value.extraKind} onChange={(e) => onChange({ ...value, extraKind: e.target.value as ExtraKind })}>
          <option value="none">None</option>
          <option value="gallery">Gallery</option>
          <option value="screenshots">Screenshots</option>
          <option value="livePreview">Live Preview</option>
        </Select>
      </Field>
      {value.extraKind === "gallery" && <GalleryEditor label="Gallery images" values={value.gallery} onChange={(gallery) => onChange({ ...value, gallery })} />}
      {value.extraKind === "screenshots" && <GalleryEditor label="Screenshots" values={value.screenshots} onChange={(screenshots) => onChange({ ...value, screenshots })} />}
      {value.extraKind === "livePreview" && (
        <Field label="Live preview URL (leave blank for 'coming soon')">
          <Input value={value.livePreviewUrl} onChange={(e) => onChange({ ...value, livePreviewUrl: e.target.value })} placeholder="https://..." />
        </Field>
      )}
    </div>
  );
}

/* ── Full editor: design shape (Brand & Graphic Design) ──────────────── */

export function DesignCaseStudyEditor({ value, onChange, activeTab }: { value: DesignCaseStudy; onChange: (v: DesignCaseStudy) => void; activeTab: string }) {
  if (activeTab === "Overview") {
    return (
      <div className="flex flex-col gap-5">
        <Field label="Category"><Input value={value.category} onChange={(e) => onChange({ ...value, category: e.target.value })} /></Field>
        <Field label="Summary"><Textarea value={value.summary} className="min-h-[70px] font-sans text-sm" onChange={(e) => onChange({ ...value, summary: e.target.value })} /></Field>
        <TechIconsEditor values={value.techIcons} onChange={(techIcons) => onChange({ ...value, techIcons })} />
        <StringListEditor label="The problem" values={value.overview.problem} onChange={(problem) => onChange({ ...value, overview: { ...value.overview, problem } })} />
        <StringListEditor label="The solution" values={value.overview.solution} onChange={(solution) => onChange({ ...value, overview: { ...value.overview, solution } })} />
      </div>
    );
  }
  if (activeTab === "Design Process") {
    return (
      <div className="flex flex-col gap-5">
        <StringListEditor label="What the client provided" values={value.designProcess.input} onChange={(input) => onChange({ ...value, designProcess: { ...value.designProcess, input } })} />
        <WorkflowListEditor label="Process steps" values={value.designProcess.workflow} onChange={(workflow) => onChange({ ...value, designProcess: { ...value.designProcess, workflow } })} />
        <Field label="How the design was produced"><Textarea value={value.designProcess.engine} className="min-h-[60px] font-sans text-sm" onChange={(e) => onChange({ ...value, designProcess: { ...value.designProcess, engine: e.target.value } })} /></Field>
        <Field label="How feedback was incorporated"><Textarea value={value.designProcess.refinements} className="min-h-[60px] font-sans text-sm" onChange={(e) => onChange({ ...value, designProcess: { ...value.designProcess, refinements: e.target.value } })} /></Field>
        <Field label="How quality was verified"><Textarea value={value.designProcess.qa} className="min-h-[60px] font-sans text-sm" onChange={(e) => onChange({ ...value, designProcess: { ...value.designProcess, qa: e.target.value } })} /></Field>
      </div>
    );
  }
  if (activeTab === "Key Features") {
    return <TitledListEditor label="Key features" values={value.keyFeatures} onChange={(keyFeatures) => onChange({ ...value, keyFeatures })} />;
  }
  if (activeTab === "Use Cases") {
    return <TitledListEditor label="Use cases" values={value.useCases} onChange={(useCases) => onChange({ ...value, useCases })} />;
  }
  if (activeTab === "Customization & Scalability") {
    return <TitledListEditor label="Customization & scalability" values={value.scalability} onChange={(scalability) => onChange({ ...value, scalability })} />;
  }
  // Gallery
  return <GalleryEditor label="Gallery images (at least one required)" values={value.gallery} onChange={(gallery) => onChange({ ...value, gallery })} />;
}
