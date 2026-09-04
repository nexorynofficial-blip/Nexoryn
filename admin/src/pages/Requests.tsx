import { useCallback, useEffect, useState } from "react";
import { Check, Clock, Inbox, Send, X } from "lucide-react";
import { api, ApiRequestError } from "../lib/api";
import type { DebtRequest, DebtRequests } from "../types";
import { Badge, Button, Card, EmptyState, ErrorBanner, Input, PageHeader, Spinner } from "../components/ui";

const money = (n: number) => n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const STATUS_TONE = { pending: "warning", approved: "success", rejected: "danger" } as const;

/** Plain-English description of what a request would actually do. */
function effectOf(r: DebtRequest) {
  if (r.paidTo === "Nexoryn") {
    return `Clears ${money(r.amount)} of ${r.actionBy}'s personal withdrawal debt to the company.`;
  }
  return `Moves ${money(r.amount)} of capital credit from ${r.paidTo} to ${r.actionBy}, closing that much of the gap between them.`;
}

function RequestCard({
  request,
  onDecided,
}: {
  request: DebtRequest;
  onDecided: () => void;
}) {
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState<"approve" | "reject" | null>(null);
  const [error, setError] = useState("");

  const decide = async (decision: "approve" | "reject") => {
    setBusy(decision);
    setError("");
    try {
      await api.post(`/api/v1/admin/finance/investments/${request.id}/${decision}`, {
        note: note.trim() || undefined,
      });
      onDecided();
    } catch (err) {
      setError(err instanceof ApiRequestError ? err.message : `Could not ${decision} this request`);
      setBusy(null);
    }
  };

  return (
    <Card className="p-5">
      <div className="mb-3 flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-lg font-semibold text-white">{money(request.amount)}</p>
          <p className="text-sm text-white/60">
            {request.actionBy} → {request.paidTo}
          </p>
        </div>
        <Badge tone={STATUS_TONE[request.approvalStatus]}>{request.approvalStatus}</Badge>
      </div>

      <p className="mb-3 text-sm text-white/70">{request.description}</p>

      <p className="mb-4 rounded-lg border border-white/10 bg-black/20 p-3 text-xs text-white/50">
        {effectOf(request)}
      </p>

      <div className="mb-4 flex flex-wrap gap-x-6 gap-y-1 text-xs text-white/40">
        <span>Logged by {request.enteredBy}</span>
        <span>Dated {new Date(request.date).toLocaleDateString()}</span>
        {request.decidedBy && (
          <span>
            {request.approvalStatus === "approved" ? "Approved" : "Rejected"} by {request.decidedBy}
            {request.decidedAt ? ` on ${new Date(request.decidedAt).toLocaleDateString()}` : ""}
          </span>
        )}
      </div>

      {request.decisionNote && (
        <p className="mb-4 text-sm text-white/60">
          <span className="text-white/40">Note: </span>
          {request.decisionNote}
        </p>
      )}

      <ErrorBanner message={error} />

      {request.canDecide && (
        <div className="flex flex-col gap-3 border-t border-white/10 pt-4">
          <Input
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Optional note (recommended when rejecting)"
          />
          <div className="flex gap-2">
            <Button onClick={() => decide("approve")} loading={busy === "approve"} disabled={busy !== null}>
              <Check className="h-4 w-4" /> Approve
            </Button>
            <Button
              variant="secondary"
              onClick={() => decide("reject")}
              loading={busy === "reject"}
              disabled={busy !== null}
            >
              <X className="h-4 w-4" /> Reject
            </Button>
          </div>
        </div>
      )}

      {!request.canDecide && request.approvalStatus === "pending" && (
        <p className="border-t border-white/10 pt-4 text-xs text-white/40">
          Waiting on {request.eligibleApprovers.join(" or ") || "someone"} to decide.
        </p>
      )}
    </Card>
  );
}

function Section({
  icon: Icon,
  title,
  hint,
  requests,
  onDecided,
  emptyMessage,
}: {
  icon: typeof Inbox;
  title: string;
  hint: string;
  requests: DebtRequest[];
  onDecided: () => void;
  emptyMessage: string;
}) {
  return (
    <section className="mb-10">
      <div className="mb-3 flex items-center gap-2">
        <Icon className="h-4 w-4 text-accent-from" />
        <h2 className="text-sm font-semibold uppercase tracking-wide text-white/70">{title}</h2>
        {requests.length > 0 && <Badge tone="neutral">{requests.length}</Badge>}
      </div>
      <p className="mb-4 text-xs text-white/40">{hint}</p>
      {requests.length === 0 ? (
        <EmptyState message={emptyMessage} />
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          {requests.map((r) => (
            <RequestCard key={r.id} request={r} onDecided={onDecided} />
          ))}
        </div>
      )}
    </section>
  );
}

export default function Requests() {
  const [data, setData] = useState<DebtRequests | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(() => {
    setLoading(true);
    api
      .get<DebtRequests>("/api/v1/admin/finance/requests")
      .then(setData)
      .catch((err) => setError(err instanceof ApiRequestError ? err.message : "Failed to load requests"))
      .finally(() => setLoading(false));
  }, []);

  useEffect(load, [load]);

  return (
    <div>
      <PageHeader
        title="Requests"
        description="Debt payments need the other side's approval before they change any number. Nothing here affects the Finance page until it's approved."
      />
      <ErrorBanner message={error} />

      {loading ? (
        <Spinner />
      ) : !data ? (
        <EmptyState message="No request data." />
      ) : (
        <>
          <Section
            icon={Inbox}
            title="Needs your decision"
            hint="Someone logged a payment that only counts once you confirm it."
            requests={data.incoming}
            onDecided={load}
            emptyMessage="Nothing waiting on you."
          />
          <Section
            icon={Send}
            title="Waiting on someone else"
            hint="You raised these. They change nothing until approved."
            requests={data.outgoing}
            onDecided={load}
            emptyMessage="You have no pending requests out."
          />
          <Section
            icon={Clock}
            title="Decided"
            hint="Approved requests are counted in Finance. Rejected ones were discarded and changed nothing."
            requests={data.history}
            onDecided={load}
            emptyMessage="Nothing decided yet."
          />
        </>
      )}
    </div>
  );
}
