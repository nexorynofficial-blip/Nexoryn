import { useEffect, useState } from "react";
import { Download, Plus, Trash2 } from "lucide-react";
import { api, ApiRequestError } from "../lib/api";
import type { FAQ } from "../types";
import { Badge, Button, Card, ConfirmDialog, ErrorBanner, Field, Input, PageHeader, Spinner, Textarea } from "../components/ui";
import { WEBSITE_FAQS } from "../lib/constants";

function FaqEditor({ faq, onSaved, onCancel }: { faq: FAQ | null; onSaved: () => void; onCancel: () => void }) {
  const [question, setQuestion] = useState(faq?.question ?? "");
  const [answer, setAnswer] = useState(faq?.answer ?? "");
  const [category, setCategory] = useState(faq?.category ?? "general");
  const [order, setOrder] = useState(String(faq?.order ?? 0));
  const [isActive, setIsActive] = useState(faq?.isActive ?? true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const handleSave = async () => {
    setSaving(true);
    setError("");
    const payload = { question: question.trim(), answer: answer.trim(), category: category.trim(), order: Number(order) || 0, isActive };
    try {
      if (faq) await api.put(`/api/v1/admin/faqs/${faq.id}`, payload);
      else await api.post("/api/v1/admin/faqs", payload);
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
      <Field label="Question"><Input value={question} onChange={(e) => setQuestion(e.target.value)} /></Field>
      <div className="mt-3"><Field label="Answer"><Textarea value={answer} onChange={(e) => setAnswer(e.target.value)} className="min-h-[90px] font-sans text-sm" /></Field></div>
      <div className="mt-3 grid grid-cols-3 gap-3">
        <Field label="Category"><Input value={category} onChange={(e) => setCategory(e.target.value)} /></Field>
        <Field label="Order"><Input type="number" value={order} onChange={(e) => setOrder(e.target.value)} /></Field>
        <label className="flex items-center gap-2 self-end pb-2 text-sm text-white/70">
          <input type="checkbox" checked={isActive} onChange={(e) => setIsActive(e.target.checked)} /> Active
        </label>
      </div>
      <div className="mt-4 flex justify-end gap-2">
        <Button variant="secondary" onClick={onCancel}>Cancel</Button>
        <Button onClick={handleSave} loading={saving}>Save</Button>
      </div>
    </Card>
  );
}

export default function Faqs() {
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editing, setEditing] = useState<FAQ | "new" | null>(null);
  const [pendingDelete, setPendingDelete] = useState<FAQ | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [importing, setImporting] = useState(false);

  const load = () => {
    api
      .get<{ items: FAQ[] }>("/api/v1/admin/faqs")
      .then((res) => setFaqs(res.items))
      .catch((err) => setError(err instanceof ApiRequestError ? err.message : "Failed to load FAQs"))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const handleDelete = async () => {
    if (!pendingDelete) return;
    setDeleting(true);
    try {
      await api.delete(`/api/v1/admin/faqs/${pendingDelete.id}`);
      setPendingDelete(null);
      load();
    } finally {
      setDeleting(false);
    }
  };

  const missingFromSite = WEBSITE_FAQS.filter(
    (site) => !faqs.some((f) => f.question.trim().toLowerCase() === site.question.trim().toLowerCase()),
  );

  const handleImport = async () => {
    setImporting(true);
    setError("");
    try {
      for (const [index, f] of missingFromSite.entries()) {
        await api.post("/api/v1/admin/faqs", {
          question: f.question,
          answer: f.answer,
          category: "general",
          order: faqs.length + index,
          isActive: true,
        });
      }
      load();
    } catch (err) {
      setError(err instanceof ApiRequestError ? err.message : "Import failed");
    } finally {
      setImporting(false);
    }
  };

  if (loading) return <Spinner />;

  return (
    <div>
      <PageHeader
        title="FAQs"
        description="Frequently asked questions on the Contact page."
        actions={
          <div className="flex gap-2">
            {missingFromSite.length > 0 && (
              <Button variant="secondary" onClick={handleImport} loading={importing}>
                <Download className="h-4 w-4" /> Import {missingFromSite.length} from website
              </Button>
            )}
            <Button onClick={() => setEditing("new")}><Plus className="h-4 w-4" /> New FAQ</Button>
          </div>
        }
      />
      <ErrorBanner message={error} />

      {editing === "new" && <div className="mb-4"><FaqEditor faq={null} onSaved={() => { setEditing(null); load(); }} onCancel={() => setEditing(null)} /></div>}

      <div className="flex flex-col gap-3">
        {faqs.map((f) =>
          editing === f ? (
            <FaqEditor key={f.id} faq={f} onSaved={() => { setEditing(null); load(); }} onCancel={() => setEditing(null)} />
          ) : (
            <Card key={f.id} className="p-4">
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-medium text-white">{f.question}</p>
                    {!f.isActive && <Badge tone="warning">Inactive</Badge>}
                  </div>
                  <p className="mt-1 line-clamp-2 text-sm text-white/60">{f.answer}</p>
                </div>
                <div className="flex shrink-0 gap-3">
                  <button onClick={() => setEditing(f)} className="text-xs text-accent-to hover:underline">Edit</button>
                  <button onClick={() => setPendingDelete(f)} className="text-white/30 hover:text-red-400">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </Card>
          ),
        )}
      </div>

      <ConfirmDialog open={!!pendingDelete} title="Delete this FAQ?" description="This can't be undone." onConfirm={handleDelete} onCancel={() => setPendingDelete(null)} loading={deleting} />
    </div>
  );
}
