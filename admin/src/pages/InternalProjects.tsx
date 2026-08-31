import { useEffect, useState } from "react";
import { ExternalLink, Plus, Trash2 } from "lucide-react";
import { api, ApiRequestError } from "../lib/api";
import type { InternalProject } from "../types";
import { Badge, Button, Card, ConfirmDialog, ErrorBanner, Field, Input, PageHeader, Select, Spinner } from "../components/ui";

const SERVICE_TYPES = ["Automation", "Web Development", "Brand & Graphic Design"] as const;

function ProjectEditor({ onSaved, onCancel }: { onSaved: () => void; onCancel: () => void }) {
  const [name, setName] = useState("");
  const [note, setNote] = useState("");
  const [serviceType, setServiceType] = useState<(typeof SERVICE_TYPES)[number]>("Automation");
  const [googleDriveLink, setGoogleDriveLink] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const handleSave = async () => {
    if (!name || !googleDriveLink) return setError("Name and Google Drive link are required.");
    setSaving(true);
    setError("");
    try {
      await api.post("/api/v1/admin/internal-projects", {
        name,
        note: note || undefined,
        serviceType,
        googleDriveLink,
      });
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
        <Field label="Service Type">
          <Select value={serviceType} onChange={(e) => setServiceType(e.target.value as typeof serviceType)}>
            {SERVICE_TYPES.map((s) => <option key={s} value={s}>{s}</option>)}
          </Select>
        </Field>
        <Field label="Google Drive link"><Input value={googleDriveLink} onChange={(e) => setGoogleDriveLink(e.target.value)} placeholder="https://drive.google.com/..." /></Field>
      </div>
      <div className="mt-3"><Field label="Note (optional)"><Input value={note} onChange={(e) => setNote(e.target.value)} /></Field></div>
      <div className="mt-4 flex justify-end gap-2">
        <Button variant="secondary" onClick={onCancel}>Cancel</Button>
        <Button onClick={handleSave} loading={saving}>Save</Button>
      </div>
    </Card>
  );
}

export default function InternalProjects() {
  const [projects, setProjects] = useState<InternalProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [creating, setCreating] = useState(false);
  const [pendingDelete, setPendingDelete] = useState<InternalProject | null>(null);
  const [deleting, setDeleting] = useState(false);

  const load = () => {
    api
      .get<{ items: InternalProject[] }>("/api/v1/admin/internal-projects")
      .then((res) => setProjects(res.items))
      .catch((err) => setError(err instanceof ApiRequestError ? err.message : "Failed to load"))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const handleDelete = async () => {
    if (!pendingDelete) return;
    setDeleting(true);
    try {
      await api.delete(`/api/v1/admin/internal-projects/${pendingDelete.id}`);
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
        title="Internal Projects"
        description="Shared repository of internal work, linked to Google Drive. Visible to every admin."
        actions={<Button onClick={() => setCreating(true)}><Plus className="h-4 w-4" /> New</Button>}
      />
      <ErrorBanner message={error} />

      {creating && <div className="mb-4"><ProjectEditor onSaved={() => { setCreating(false); load(); }} onCancel={() => setCreating(false)} /></div>}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {projects.map((p) => (
          <Card key={p.id} className="p-4">
            <div className="flex items-start justify-between">
              <div className="min-w-0">
                <p className="truncate font-medium text-white">{p.name}</p>
                <p className="text-xs text-white/40">by {p.uploader?.name ?? "Unknown"}</p>
              </div>
              <button onClick={() => setPendingDelete(p)} className="shrink-0 text-white/30 hover:text-red-400">
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
            <div className="mt-2 flex flex-wrap gap-1.5">
              <Badge>{p.serviceType}</Badge>
              <Badge tone={p.status === "active" ? "success" : "neutral"}>{p.status}</Badge>
            </div>
            {p.note && <p className="mt-2 text-sm text-white/60">{p.note}</p>}
            <a href={p.googleDriveLink} target="_blank" rel="noopener noreferrer" className="mt-3 inline-flex items-center gap-1.5 text-xs text-accent-to hover:underline">
              Open in Google Drive <ExternalLink className="h-3 w-3" />
            </a>
          </Card>
        ))}
      </div>

      <ConfirmDialog open={!!pendingDelete} title={`Delete "${pendingDelete?.name}"?`} description="This can't be undone." onConfirm={handleDelete} onCancel={() => setPendingDelete(null)} loading={deleting} />
    </div>
  );
}
