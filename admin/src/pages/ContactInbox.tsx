import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { Download, RefreshCw, Trash2, X } from "lucide-react";
import { api, ApiRequestError } from "../lib/api";
import type { ContactSubmission } from "../types";
import { Badge, Button, Card, ErrorBanner, PageHeader, Select, Spinner } from "../components/ui";

const STATUS_TONE: Record<ContactSubmission["status"], "warning" | "neutral" | "success"> = {
  new: "warning",
  read: "neutral",
  handled: "success",
};

function SubmissionDetail({ submission, onClose, onUpdated, onDeleted }: { submission: ContactSubmission; onClose: () => void; onUpdated: () => void; onDeleted: () => void }) {
  const [status, setStatus] = useState(submission.status);
  const [resending, setResending] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState("");

  const handleStatusChange = async (next: ContactSubmission["status"]) => {
    setStatus(next);
    try {
      await api.patch(`/api/v1/admin/contact-submissions/${submission.id}`, { status: next });
      onUpdated();
    } catch (err) {
      setError(err instanceof ApiRequestError ? err.message : "Failed to update status");
    }
  };

  const handleResend = async () => {
    setResending(true);
    setError("");
    try {
      await api.post(`/api/v1/admin/contact-submissions/${submission.id}/resend-email`);
      onUpdated();
    } catch (err) {
      setError(err instanceof ApiRequestError ? err.message : "Resend failed");
    } finally {
      setResending(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("Permanently delete this submission? This can't be undone.")) return;
    setDeleting(true);
    setError("");
    try {
      await api.delete(`/api/v1/admin/contact-submissions/${submission.id}`);
      onDeleted();
    } catch (err) {
      setError(err instanceof ApiRequestError ? err.message : "Delete failed");
      setDeleting(false);
    }
  };

  // Portalled to <body> like the app's other dialogs: rendered inside <main>
  // it would sit in main's stacking context, under the mobile top bar.
  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 max-md:p-3" onClick={onClose}>
      <Card className="w-full max-w-lg p-6 max-md:flex max-md:max-h-[calc(100dvh-1.5rem)] max-md:flex-col max-md:p-4" onClick={(e) => e.stopPropagation()}>
        <div className="mb-4 flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h3 className="text-base font-semibold text-white max-md:break-words">{submission.fields.name ?? "Unknown"}</h3>
            <p className="text-xs text-white/40">{submission.formId} · {new Date(submission.createdAt).toLocaleString()}</p>
          </div>
          <div className="flex shrink-0 items-center gap-3 max-md:gap-1">
            <button onClick={handleDelete} disabled={deleting} title="Delete submission" aria-label="Delete submission" className="text-white/40 hover:text-red-400 disabled:opacity-50 max-md:p-2">
              <Trash2 className="h-4 w-4" />
            </button>
            <button onClick={onClose} aria-label="Close" className="text-white/40 hover:text-white max-md:-mr-2 max-md:p-2"><X className="h-5 w-5" /></button>
          </div>
        </div>

        <ErrorBanner message={error} />

        <div className="mb-4 flex items-center gap-3 max-md:flex-wrap">
          <Select value={status} onChange={(e) => handleStatusChange(e.target.value as ContactSubmission["status"])} className="w-40">
            <option value="new">New</option>
            <option value="read">Read</option>
            <option value="handled">Handled</option>
          </Select>
          {submission.emailedAt ? (
            <Badge tone="success">Emailed {new Date(submission.emailedAt).toLocaleTimeString()}</Badge>
          ) : (
            <>
              <Badge tone="danger">Not emailed</Badge>
              <Button variant="secondary" onClick={handleResend} loading={resending}>
                <RefreshCw className="h-3.5 w-3.5" /> Resend
              </Button>
            </>
          )}
        </div>

        <div className="max-h-96 overflow-y-auto rounded-lg border border-white/10 bg-black/20 p-4 max-md:max-h-none max-md:min-h-0 max-md:flex-1">
          {Object.entries(submission.fields).map(([key, value]) => (
            <div key={key} className="mb-3 last:mb-0">
              <p className="text-[11px] uppercase tracking-wide text-white/40">{key}</p>
              <p className="whitespace-pre-wrap text-sm text-white/80 max-md:break-words">{value}</p>
            </div>
          ))}
        </div>
      </Card>
    </div>,
    document.body,
  );
}

export default function ContactInbox() {
  const [submissions, setSubmissions] = useState<ContactSubmission[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [active, setActive] = useState<ContactSubmission | null>(null);

  const load = () => {
    setLoading(true);
    const query = statusFilter ? `?status=${statusFilter}` : "";
    api
      .get<{ items: ContactSubmission[]; total: number }>(`/api/v1/admin/contact-submissions${query}`)
      .then((res) => {
        setSubmissions(res.items);
        setTotal(res.total);
      })
      .catch((err) => setError(err instanceof ApiRequestError ? err.message : "Failed to load submissions"))
      .finally(() => setLoading(false));
  };

  useEffect(load, [statusFilter]);

  const handleExport = () => {
    window.open(`${api.baseUrl}/api/v1/admin/contact-submissions/export`, "_blank");
  };

  return (
    <div>
      <PageHeader
        title="Contact Inbox"
        description={`${total} submission${total === 1 ? "" : "s"} total.`}
        actions={
          <div className="flex gap-2 max-md:w-full">
            <Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="max-md:min-w-0 max-md:flex-1">
              <option value="">All statuses</option>
              <option value="new">New</option>
              <option value="read">Read</option>
              <option value="handled">Handled</option>
            </Select>
            <Button variant="secondary" onClick={handleExport} className="max-md:shrink-0"><Download className="h-4 w-4" /> Export CSV</Button>
          </div>
        }
      />
      <ErrorBanner message={error} />

      {loading ? (
        <Spinner />
      ) : submissions.length === 0 ? (
        <Card className="p-10 text-center text-sm text-white/40">No submissions match this filter.</Card>
      ) : (
        <>
        {/* Phones: a tappable card per submission instead of a 5-column table. */}
        <div className="flex flex-col gap-3 md:hidden">
          {submissions.map((s) => (
            <button key={s.id} type="button" onClick={() => setActive(s)} className="text-left">
              <Card className="p-4 transition active:bg-white/[0.04]">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate font-medium text-white">{s.fields.name ?? "Unknown"}</p>
                    <p className="truncate text-xs text-white/40">{s.fields.email}</p>
                  </div>
                  <Badge tone={STATUS_TONE[s.status]}>{s.status}</Badge>
                </div>
                <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-white/50">
                  <span>{s.formId}</span>
                  <span>{new Date(s.createdAt).toLocaleString()}</span>
                  {!s.emailedAt && <span className="text-red-400">Email failed</span>}
                </div>
              </Card>
            </button>
          ))}
        </div>
        <Card className="overflow-hidden max-md:hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/5 text-left text-xs uppercase tracking-wide text-white/40">
                <th className="p-4">From</th>
                <th className="p-4">Type</th>
                <th className="p-4">Status</th>
                <th className="p-4">Email</th>
                <th className="p-4">Received</th>
              </tr>
            </thead>
            <tbody>
              {submissions.map((s) => (
                <tr key={s.id} onClick={() => setActive(s)} className="cursor-pointer border-b border-white/5 last:border-0 hover:bg-white/[0.02]">
                  <td className="p-4">
                    <p className="font-medium text-white">{s.fields.name ?? "Unknown"}</p>
                    <p className="text-xs text-white/40">{s.fields.email}</p>
                  </td>
                  <td className="p-4 text-white/70">{s.formId}</td>
                  <td className="p-4"><Badge tone={STATUS_TONE[s.status]}>{s.status}</Badge></td>
                  <td className="p-4">{s.emailedAt ? <Badge tone="success">Sent</Badge> : <Badge tone="danger">Failed</Badge>}</td>
                  <td className="p-4 text-white/50">{new Date(s.createdAt).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
        </>
      )}

      {active && (
        <SubmissionDetail
          submission={active}
          onClose={() => setActive(null)}
          onUpdated={() => { load(); setActive(null); }}
          onDeleted={() => { load(); setActive(null); }}
        />
      )}
    </div>
  );
}
