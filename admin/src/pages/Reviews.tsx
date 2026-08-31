import { useEffect, useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { api, ApiRequestError } from "../lib/api";
import type { Review } from "../types";
import { Badge, Button, Card, ConfirmDialog, ErrorBanner, Field, Input, PageHeader, Select, Spinner, Textarea } from "../components/ui";

const SERVICES = ["Automation", "Web Development", "Graphic Design"] as const;

function ReviewEditor({ review, onSaved, onCancel }: { review: Review | null; onSaved: () => void; onCancel: () => void }) {
  const [displayId, setDisplayId] = useState(review?.displayId ?? "");
  const [name, setName] = useState(review?.name ?? "");
  const [location, setLocation] = useState(review?.location ?? "");
  const [service, setService] = useState<(typeof SERVICES)[number]>(review?.service ?? "Automation");
  const [text, setText] = useState(review?.text ?? "");
  const [order, setOrder] = useState(String(review?.order ?? 0));
  const [isFeatured, setIsFeatured] = useState(review?.isFeatured ?? false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const handleSave = async () => {
    setSaving(true);
    setError("");
    const payload = { displayId: displayId.trim(), name: name.trim(), location: location.trim(), service, text: text.trim(), order: Number(order) || 0, isFeatured };
    try {
      if (review) await api.put(`/api/v1/admin/reviews/${review.id}`, payload);
      else await api.post("/api/v1/admin/reviews", payload);
      onSaved();
    } catch (err) {
      setError(err instanceof ApiRequestError ? err.message : "Save failed");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card className="p-5">
      <ErrorBanner message={error} />
      <div className="grid grid-cols-2 gap-3">
        <Field label="Name"><Input value={name} onChange={(e) => setName(e.target.value)} /></Field>
        <Field label="Display ID (unique handle)"><Input value={displayId} onChange={(e) => setDisplayId(e.target.value)} disabled={!!review} /></Field>
        <Field label="Location"><Input value={location} onChange={(e) => setLocation(e.target.value)} /></Field>
        <Field label="Service">
          <Select value={service} onChange={(e) => setService(e.target.value as typeof service)}>
            {SERVICES.map((s) => <option key={s} value={s}>{s}</option>)}
          </Select>
        </Field>
        <Field label="Order"><Input type="number" value={order} onChange={(e) => setOrder(e.target.value)} /></Field>
        <label className="flex items-center gap-2 self-end pb-2 text-sm text-white/70">
          <input type="checkbox" checked={isFeatured} onChange={(e) => setIsFeatured(e.target.checked)} />
          Featured on homepage
        </label>
      </div>
      <div className="mt-3">
        <Field label="Review text"><Textarea value={text} onChange={(e) => setText(e.target.value)} className="min-h-[100px] font-sans text-sm" /></Field>
      </div>
      <div className="mt-4 flex justify-end gap-2">
        <Button variant="secondary" onClick={onCancel}>Cancel</Button>
        <Button onClick={handleSave} loading={saving}>Save</Button>
      </div>
    </Card>
  );
}

export default function Reviews() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editing, setEditing] = useState<Review | "new" | null>(null);
  const [pendingDelete, setPendingDelete] = useState<Review | null>(null);
  const [deleting, setDeleting] = useState(false);

  const load = () => {
    api
      .get<{ items: Review[] }>("/api/v1/admin/reviews")
      .then((res) => setReviews(res.items))
      .catch((err) => setError(err instanceof ApiRequestError ? err.message : "Failed to load reviews"))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const handleDelete = async () => {
    if (!pendingDelete) return;
    setDeleting(true);
    try {
      await api.delete(`/api/v1/admin/reviews/${pendingDelete.id}`);
      setPendingDelete(null);
      load();
    } finally {
      setDeleting(false);
    }
  };

  if (loading) return <Spinner />;

  return (
    <div>
      <PageHeader
        title="Reviews"
        description="Client testimonials shown on the Reviews page, filterable by service."
        actions={<Button onClick={() => setEditing("new")}><Plus className="h-4 w-4" /> New Review</Button>}
      />
      <ErrorBanner message={error} />

      {editing === "new" && <div className="mb-4"><ReviewEditor review={null} onSaved={() => { setEditing(null); load(); }} onCancel={() => setEditing(null)} /></div>}

      <div className="flex flex-col gap-3">
        {reviews.map((r) =>
          editing === r ? (
            <ReviewEditor key={r.id} review={r} onSaved={() => { setEditing(null); load(); }} onCancel={() => setEditing(null)} />
          ) : (
            <Card key={r.id} className="p-4">
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-medium text-white">{r.name}</p>
                    <Badge>{r.service}</Badge>
                    {r.isFeatured && <Badge tone="success">Featured</Badge>}
                  </div>
                  <p className="text-xs text-white/40">{r.location}</p>
                  <p className="mt-2 line-clamp-2 text-sm text-white/60">{r.text}</p>
                </div>
                <div className="flex shrink-0 gap-3">
                  <button onClick={() => setEditing(r)} className="text-xs text-accent-to hover:underline">Edit</button>
                  <button onClick={() => setPendingDelete(r)} className="text-white/30 hover:text-red-400">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </Card>
          ),
        )}
      </div>

      <ConfirmDialog
        open={!!pendingDelete}
        title={`Delete review from "${pendingDelete?.name}"?`}
        description="This can't be undone."
        onConfirm={handleDelete}
        onCancel={() => setPendingDelete(null)}
        loading={deleting}
      />
    </div>
  );
}
