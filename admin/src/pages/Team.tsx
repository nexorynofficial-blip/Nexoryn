import { useEffect, useState } from "react";
import { ImageIcon, Plus, Trash2 } from "lucide-react";
import { api, ApiRequestError } from "../lib/api";
import type { Asset, TeamMember } from "../types";
import { Button, Card, ConfirmDialog, ErrorBanner, Field, Input, PageHeader, Spinner } from "../components/ui";
import { AssetPicker } from "../components/AssetPicker";
import { TEAM_ROLE_PRESETS } from "../lib/constants";

function MemberEditor({ member, onSaved, onCancel }: { member: TeamMember | null; onSaved: () => void; onCancel: () => void }) {
  const [name, setName] = useState(member?.name ?? "");
  const [role, setRole] = useState(member?.role ?? "");
  const [order, setOrder] = useState(String(member?.order ?? 0));
  const [photo, setPhoto] = useState<Asset | null>(member?.photo ?? null);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const handleSave = async () => {
    setSaving(true);
    setError("");
    const payload = { name: name.trim(), role: role.trim(), order: Number(order) || 0, photoId: photo?.id ?? null };
    try {
      if (member) await api.put(`/api/v1/admin/team/${member.id}`, payload);
      else await api.post("/api/v1/admin/team", payload);
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
      <div className="flex items-center gap-4">
        {photo ? (
          <img src={photo.url} alt={photo.altText} className="h-16 w-16 rounded-full object-cover" onError={(e) => (e.currentTarget.style.opacity = "0.15")} />
        ) : (
          <div className="flex h-16 w-16 items-center justify-center rounded-full border border-dashed border-white/15 text-white/20">
            <ImageIcon className="h-5 w-5" />
          </div>
        )}
        <Button type="button" variant="secondary" onClick={() => setPickerOpen(true)}>Choose photo</Button>
      </div>
      <div className="mt-4 grid grid-cols-3 gap-3">
        <Field label="Name"><Input value={name} onChange={(e) => setName(e.target.value)} /></Field>
        <Field label="Role">
          <Input value={role} onChange={(e) => setRole(e.target.value)} list="team-role-presets" placeholder="e.g. Co-Founder/Admin" />
          <datalist id="team-role-presets">
            {TEAM_ROLE_PRESETS.map((r) => <option key={r} value={r} />)}
          </datalist>
        </Field>
        <Field label="Order"><Input type="number" value={order} onChange={(e) => setOrder(e.target.value)} /></Field>
      </div>
      <div className="mt-4 flex justify-end gap-2">
        <Button variant="secondary" onClick={onCancel}>Cancel</Button>
        <Button onClick={handleSave} loading={saving}>Save</Button>
      </div>
      {pickerOpen && <AssetPicker onSelect={(a) => { setPhoto(a); setPickerOpen(false); }} onClose={() => setPickerOpen(false)} />}
    </Card>
  );
}

export default function Team() {
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editing, setEditing] = useState<TeamMember | "new" | null>(null);
  const [pendingDelete, setPendingDelete] = useState<TeamMember | null>(null);
  const [deleting, setDeleting] = useState(false);

  const load = () => {
    api
      .get<{ items: TeamMember[] }>("/api/v1/admin/team")
      .then((res) => setMembers(res.items))
      .catch((err) => setError(err instanceof ApiRequestError ? err.message : "Failed to load team"))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const handleDelete = async () => {
    if (!pendingDelete) return;
    setDeleting(true);
    try {
      await api.delete(`/api/v1/admin/team/${pendingDelete.id}`);
      setPendingDelete(null);
      load();
    } finally {
      setDeleting(false);
    }
  };

  if (loading) return <Spinner />;

  return (
    <div>
      <PageHeader title="Team" description="About page team cards." actions={<Button onClick={() => setEditing("new")}><Plus className="h-4 w-4" /> New Member</Button>} />
      <ErrorBanner message={error} />

      {editing === "new" && <div className="mb-4"><MemberEditor member={null} onSaved={() => { setEditing(null); load(); }} onCancel={() => setEditing(null)} /></div>}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {members.map((m) =>
          editing === m ? (
            <div key={m.id} className="sm:col-span-2 lg:col-span-3">
              <MemberEditor member={m} onSaved={() => { setEditing(null); load(); }} onCancel={() => setEditing(null)} />
            </div>
          ) : (
            <Card key={m.id} className="flex items-center gap-4 p-4">
              {m.photo ? (
                <img src={m.photo.url} alt={m.photo.altText} className="h-14 w-14 rounded-full object-cover" onError={(e) => (e.currentTarget.style.opacity = "0.15")} />
              ) : (
                <div className="flex h-14 w-14 items-center justify-center rounded-full border border-dashed border-white/15 text-white/20">
                  <ImageIcon className="h-5 w-5" />
                </div>
              )}
              <div className="min-w-0 flex-1">
                <p className="truncate font-medium text-white">{m.name}</p>
                <p className="text-xs text-white/40">{m.role}</p>
              </div>
              <div className="flex shrink-0 gap-3">
                <button onClick={() => setEditing(m)} className="text-xs text-accent-to hover:underline">Edit</button>
                <button onClick={() => setPendingDelete(m)} className="text-white/30 hover:text-red-400">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </Card>
          ),
        )}
      </div>

      <ConfirmDialog open={!!pendingDelete} title={`Remove "${pendingDelete?.name}"?`} description="This removes them from the About page." onConfirm={handleDelete} onCancel={() => setPendingDelete(null)} loading={deleting} />
    </div>
  );
}
