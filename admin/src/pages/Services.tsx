import { useEffect, useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { api, ApiRequestError } from "../lib/api";
import type { ServiceCategory, SubService } from "../types";
import { Badge, Button, Card, ConfirmDialog, ErrorBanner, Field, Input, PageHeader, Spinner, Textarea } from "../components/ui";

function linesToArray(text: string): string[] {
  return text.split("\n").map((l) => l.trim()).filter(Boolean);
}

function SubServiceEditor({
  categoryId,
  subService,
  onSaved,
  onCancel,
}: {
  categoryId: string;
  subService: SubService | null;
  onSaved: () => void;
  onCancel: () => void;
}) {
  const [slug, setSlug] = useState(subService?.slug ?? "");
  const [icon, setIcon] = useState(subService?.icon ?? "Workflow");
  const [name, setName] = useState(subService?.name ?? "");
  const [description, setDescription] = useState(subService?.description ?? "");
  const [howWeWork, setHowWeWork] = useState(subService?.howWeWork.join("\n") ?? "");
  const [whatYouGet, setWhatYouGet] = useState(subService?.whatYouGet.join("\n") ?? "");
  const [platforms, setPlatforms] = useState(subService?.platforms.join(", ") ?? "");
  const [order, setOrder] = useState(String(subService?.order ?? 0));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const handleSave = async () => {
    setSaving(true);
    setError("");
    const payload = {
      slug: slug.trim(),
      icon: icon.trim(),
      name: name.trim(),
      description: description.trim(),
      howWeWork: linesToArray(howWeWork),
      whatYouGet: linesToArray(whatYouGet),
      platforms: platforms.split(",").map((p) => p.trim()).filter(Boolean),
      order: Number(order) || 0,
    };
    try {
      if (subService) {
        await api.put(`/api/v1/admin/sub-services/${subService.id}`, payload);
      } else {
        await api.post(`/api/v1/admin/services/${categoryId}/sub-services`, payload);
      }
      onSaved();
    } catch (err) {
      setError(err instanceof ApiRequestError ? err.message : "Save failed");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="rounded-lg border border-white/10 bg-black/20 p-4">
      <ErrorBanner message={error} />
      <div className="grid grid-cols-2 gap-3">
        <Field label="Name"><Input value={name} onChange={(e) => setName(e.target.value)} /></Field>
        <Field label="Slug"><Input value={slug} onChange={(e) => setSlug(e.target.value)} /></Field>
        <Field label="Icon (lucide name)"><Input value={icon} onChange={(e) => setIcon(e.target.value)} /></Field>
        <Field label="Order"><Input type="number" value={order} onChange={(e) => setOrder(e.target.value)} /></Field>
      </div>
      <div className="mt-3">
        <Field label="Description"><Textarea value={description} onChange={(e) => setDescription(e.target.value)} className="min-h-[70px] font-sans text-sm" /></Field>
      </div>
      <div className="mt-3 grid grid-cols-2 gap-3">
        <Field label="How We Work (one per line)"><Textarea value={howWeWork} onChange={(e) => setHowWeWork(e.target.value)} className="font-sans text-xs" /></Field>
        <Field label="What You Get (one per line)"><Textarea value={whatYouGet} onChange={(e) => setWhatYouGet(e.target.value)} className="font-sans text-xs" /></Field>
      </div>
      <div className="mt-3">
        <Field label="Platforms (comma-separated)"><Input value={platforms} onChange={(e) => setPlatforms(e.target.value)} /></Field>
      </div>
      <div className="mt-4 flex justify-end gap-2">
        <Button variant="secondary" onClick={onCancel}>Cancel</Button>
        <Button onClick={handleSave} loading={saving}>Save</Button>
      </div>
    </div>
  );
}

function CategoryCard({ category, onChanged }: { category: ServiceCategory; onChanged: () => void }) {
  const [editingSub, setEditingSub] = useState<SubService | "new" | null>(null);
  const [pendingDelete, setPendingDelete] = useState<SubService | null>(null);
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    if (!pendingDelete) return;
    setDeleting(true);
    try {
      await api.delete(`/api/v1/admin/sub-services/${pendingDelete.id}`);
      setPendingDelete(null);
      onChanged();
    } finally {
      setDeleting(false);
    }
  };

  return (
    <Card className="p-6">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-white">{category.serviceName}</h2>
          <p className="text-xs text-white/40">{category.overview.heading}</p>
        </div>
        <Badge>{category.subServices.length} sub-services</Badge>
      </div>

      <div className="flex flex-col gap-2">
        {category.subServices.map((sub) =>
          editingSub === sub ? (
            <SubServiceEditor
              key={sub.id}
              categoryId={category.id}
              subService={sub}
              onSaved={() => {
                setEditingSub(null);
                onChanged();
              }}
              onCancel={() => setEditingSub(null)}
            />
          ) : (
            <div key={sub.id} className="flex items-center justify-between rounded-lg border border-white/5 px-4 py-2.5 hover:bg-white/[0.02]">
              <div>
                <p className="text-sm text-white">{sub.name}</p>
                <p className="text-xs text-white/40">{sub.icon} · order {sub.order}</p>
              </div>
              <div className="flex gap-2">
                <button onClick={() => setEditingSub(sub)} className="text-xs text-accent-to hover:underline">Edit</button>
                <button onClick={() => setPendingDelete(sub)} className="text-white/30 hover:text-red-400">
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          ),
        )}

        {editingSub === "new" ? (
          <SubServiceEditor
            categoryId={category.id}
            subService={null}
            onSaved={() => {
              setEditingSub(null);
              onChanged();
            }}
            onCancel={() => setEditingSub(null)}
          />
        ) : (
          <button
            onClick={() => setEditingSub("new")}
            className="mt-1 flex items-center gap-2 rounded-lg border border-dashed border-white/10 px-4 py-2.5 text-sm text-white/40 hover:border-accent-from/40 hover:text-white"
          >
            <Plus className="h-4 w-4" /> Add sub-service
          </button>
        )}
      </div>

      <ConfirmDialog
        open={!!pendingDelete}
        title={`Delete "${pendingDelete?.name}"?`}
        description="This removes the sub-service from the Services page."
        onConfirm={handleDelete}
        onCancel={() => setPendingDelete(null)}
        loading={deleting}
      />
    </Card>
  );
}

export default function Services() {
  const [categories, setCategories] = useState<ServiceCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = () => {
    api
      .get<{ items: ServiceCategory[] }>("/api/v1/admin/services")
      .then((res) => setCategories(res.items))
      .catch((err) => setError(err instanceof ApiRequestError ? err.message : "Failed to load services"))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  if (loading) return <Spinner />;

  return (
    <div>
      <PageHeader
        title="Services"
        description="Each category's sub-services power the Services page tabs (desktop) and mobile summary."
      />
      <ErrorBanner message={error} />
      <div className="flex flex-col gap-6">
        {categories.map((cat) => (
          <CategoryCard key={cat.id} category={cat} onChanged={load} />
        ))}
      </div>
    </div>
  );
}
