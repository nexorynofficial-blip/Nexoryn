import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { RefreshCw } from "lucide-react";
import { api, ApiRequestError } from "../lib/api";
import { Button, Card, ErrorBanner, PageHeader } from "../components/ui";
import {
  DMThemes,
  LowEngagementPosts,
  Recommendations,
  UnansweredComments,
  type ActionTarget,
  type Decisions,
  type ReplyAction,
  type SocialSummaryData,
} from "../components/SocialSections";

interface SummaryResponse {
  success: boolean;
  cached: boolean;
  fetched_at?: string;
  data: SocialSummaryData | null;
  actions: Decisions;
  message?: string;
}

function formatWhen(iso: string) {
  return new Date(iso).toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function Skeleton() {
  return (
    <div className="space-y-4" aria-busy="true" aria-label="Loading summary">
      <div className="h-16 animate-pulse rounded-xl bg-white/5" />
      <div className="grid gap-4 xl:grid-cols-2">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="h-48 animate-pulse rounded-xl bg-white/5" />
        ))}
      </div>
    </div>
  );
}

export default function FacebookDashboard() {
  const navigate = useNavigate();
  const [summary, setSummary] = useState<SummaryResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [decisions, setDecisions] = useState<Decisions>({});

  const describe = useCallback(
    (err: unknown, fallback: string) => {
      if (err instanceof ApiRequestError) {
        if (err.status === 401) {
          navigate("/login", { replace: true });
          return "";
        }
        if (err.status === 422) return "Data format error. Please contact support.";
        return err.message || fallback;
      }
      return fallback;
    },
    [navigate],
  );

  const load = useCallback(
    async (isRefresh: boolean) => {
      if (isRefresh) setRefreshing(true);
      else setLoading(true);
      setError("");
      try {
        const res = await api.get<SummaryResponse>("/api/v1/admin/social/facebook/summary");
        setSummary(res);
        setDecisions(res.actions ?? {});
      } catch (err) {
        // Keep whatever is already on screen; just say it didn't update.
        setError(describe(err, "Failed to load summary. Please try again."));
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [describe],
  );

  useEffect(() => {
    load(false);
  }, [load]);

  const submitAction = async (target: ActionTarget, action: ReplyAction, editedText?: string) => {
    setError("");
    try {
      await api.put("/api/v1/admin/social/facebook/action", {
        ...(target.kind === "comment" ? { comment_id: target.id } : { dm_id: target.id }),
        action,
        ...(action === "edit" ? { edited_text: editedText } : {}),
      });
      setDecisions((prev) => ({
        ...prev,
        [target.id]: { action, edited_text: action === "edit" ? (editedText ?? null) : null },
      }));
    } catch (err) {
      setError(describe(err, "Couldn't save that action. Please try again."));
      throw err; // leaves the buttons enabled
    }
  };

  const data = summary?.data ?? null;

  return (
    <div className="mx-auto max-w-6xl">
      <PageHeader
        title="Social › Facebook"
        description="What the Social Agent found on your Page in its latest run."
        actions={
          <Button variant="secondary" onClick={() => load(true)} loading={refreshing} disabled={loading}>
            {!refreshing && <RefreshCw className="h-4 w-4" />}
            {refreshing ? "Refreshing..." : "Refresh"}
          </Button>
        }
      />

      <ErrorBanner message={error} />

      {loading ? (
        <Skeleton />
      ) : !data ? (
        <Card className="p-10 text-center">
          <p className="text-sm text-white/70">No summary yet.</p>
          <p className="mt-1 text-xs text-white/40">
            Run the Social Agent. Its results appear here once it has pushed them.
          </p>
        </Card>
      ) : (
        <>
          <div
            role="status"
            className={`mb-4 rounded-xl border px-5 py-4 ${
              data.status === "healthy"
                ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-200"
                : "border-amber-500/30 bg-amber-500/10 text-amber-200"
            }`}
          >
            {data.status === "healthy" ? (
              <>
                <p className="text-sm font-semibold">✅ No action items for today. Your Page is healthy!</p>
                <ul className="mt-1 space-y-0.5 text-xs opacity-80">
                  <li>All comments answered</li>
                  <li>Posts performing well</li>
                  <li>No unusual DM patterns</li>
                </ul>
              </>
            ) : (
              <p className="text-sm font-semibold">
                ⚠️ Found {data.total_action_items} item{data.total_action_items === 1 ? "" : "s"} to work on
              </p>
            )}
          </div>

          <div className="grid gap-4 xl:grid-cols-2">
            <UnansweredComments items={data.unanswered_comments} decisions={decisions} onSubmit={submitAction} />
            <LowEngagementPosts items={data.low_engagement_posts} />
            <DMThemes
              themes={data.dm_themes}
              replies={data.dm_replies ?? []}
              decisions={decisions}
              onSubmit={submitAction}
            />
            <Recommendations items={data.recommendations} />
          </div>

          <p className="mt-6 text-xs text-white/30">
            Last updated: {formatWhen(summary?.fetched_at ?? data.timestamp)}. Approving or editing a reply records
            the decision for the team; it is not posted to Facebook automatically.
          </p>
        </>
      )}
    </div>
  );
}
