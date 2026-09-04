import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Briefcase, GitPullRequestArrow, Inbox, MessageSquareQuote, Users, Wallet } from "lucide-react";
import { api } from "../lib/api";
import { useAuth } from "../hooks/useAuth";
import { Badge, Card, Spinner } from "../components/ui";
import type {
  ContactSubmission,
  DebtRequest,
  DebtRequests,
  FinanceDashboardData,
  PartnerFinance,
  Project,
  Review,
  TeamMember,
} from "../types";

function money(n: number) {
  return `$${n.toFixed(2)}`;
}

function greeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}

function MiniStat({ label, value, icon: Icon }: { label: string; value: number | string; icon: typeof Briefcase }) {
  return (
    <Card className="flex items-center justify-between p-4">
      <div>
        <p className="text-[11px] uppercase tracking-wide text-white/40">{label}</p>
        <p className="mt-1 text-xl font-semibold text-white">{value}</p>
      </div>
      <Icon className="h-4 w-4 text-white/30" />
    </Card>
  );
}

export default function Dashboard() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<{ projects: number; reviews: number; team: number; newSubmissions: number } | null>(
    null,
  );
  const [recent, setRecent] = useState<ContactSubmission[]>([]);
  const [finance, setFinance] = useState<FinanceDashboardData | null>(null);
  const [pendingRequests, setPendingRequests] = useState<DebtRequest[]>([]);

  useEffect(() => {
    Promise.all([
      api.get<{ items: Project[] }>("/api/v1/admin/projects"),
      api.get<{ items: Review[] }>("/api/v1/admin/reviews"),
      api.get<{ items: TeamMember[] }>("/api/v1/admin/team"),
      api.get<{ items: ContactSubmission[]; total: number }>("/api/v1/admin/contact-submissions?status=new"),
      api.get<{ items: ContactSubmission[] }>("/api/v1/admin/contact-submissions?pageSize=6"),
      api.get<FinanceDashboardData>("/api/v1/admin/finance/dashboard"),
      api.get<DebtRequests>("/api/v1/admin/finance/requests"),
    ])
      .then(([projects, reviews, team, newSubs, recentSubs, financeData, requests]) => {
        setStats({
          projects: projects.items.length,
          reviews: reviews.items.length,
          team: team.items.length,
          newSubmissions: newSubs.total,
        });
        setRecent(recentSubs.items);
        setFinance(financeData);
        setPendingRequests(requests.incoming);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading || !stats) return <Spinner />;

  const you: PartnerFinance | null = finance?.you ?? null;
  // What this partner still has to hand over: peer settlements plus anything
  // still owed back to the company from personal withdrawals.
  const totalDebt = you ? you.totalOwedToPartners + you.withdrawalDebt : 0;
  const firstName = user?.name?.split(" ")[0] ?? "there";

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-heading text-2xl font-semibold text-white">
          {greeting()}, {firstName} 👋
        </h1>
        <p className="mt-1 text-sm text-white/50">Here's what's happening with Nexoryn right now.</p>
      </div>

      {/* Debt approvals waiting on this admin — surfaced above everything
          else, since the numbers below stay wrong until they're decided. */}
      {pendingRequests.length > 0 && (
        <Link to="/requests" className="mb-8 block">
          <Card className="border-amber-400/30 bg-amber-400/[0.06] p-5 transition hover:bg-amber-400/[0.1]">
            <div className="flex items-start gap-3">
              <GitPullRequestArrow className="mt-0.5 h-5 w-5 shrink-0 text-amber-300" />
              <div>
                <p className="text-sm font-semibold text-white">
                  {pendingRequests.length} debt payment{pendingRequests.length === 1 ? "" : "s"} waiting on you
                </p>
                <p className="mt-1 text-xs text-white/60">
                  {pendingRequests
                    .slice(0, 3)
                    .map((r) => `${r.actionBy} → ${r.paidTo} (${money(r.amount)})`)
                    .join(" · ")}
                  {pendingRequests.length > 3 ? ` · +${pendingRequests.length - 3} more` : ""}
                </p>
                <p className="mt-2 text-xs text-amber-200/70">
                  These change no figure until you approve them. Review →
                </p>
              </div>
            </div>
          </Card>
        </Link>
      )}

      {/* Finance — the main focus of this page */}
      <div className="mb-8">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-white/50">Finance</h2>
          <Link to="/finance" className="text-xs text-accent-to hover:underline">Open Finance →</Link>
        </div>
        <Card className="p-6">
          {you ? (
            <>
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                <div>
                  <p className="text-xs uppercase tracking-wide text-white/40">Invested</p>
                  <p className="mt-1 text-2xl font-semibold text-white">{money(you.invested)}</p>
                  <p className="mt-0.5 text-[11px] text-white/30">Equal share {money(you.fairShare)}</p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wide text-white/40">Profit share</p>
                  <p className="mt-1 text-2xl font-semibold text-white">{money(you.profitShare)}</p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wide text-white/40">In debt</p>
                  <p className={`mt-1 text-2xl font-semibold ${totalDebt > 0 ? "text-red-400" : "text-white"}`}>{money(totalDebt)}</p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wide text-white/40">Net position</p>
                  <p className="mt-1 text-2xl font-semibold text-accent-to">{money(you.netPosition)}</p>
                </div>
              </div>

              {(you.owesToPartners.length > 0 || you.owedByPartners.length > 0 || you.withdrawalDebt > 0) && (
                <div className="mt-5 flex flex-col gap-1.5 border-t border-white/5 pt-4">
                  {you.owesToPartners.map((t) => (
                    <p key={`o-${t.actor}`} className="text-sm text-red-400">
                      You owe <span className="font-semibold">{t.actor}</span> {money(t.amount)}
                      <span className="text-white/30"> · or invest that much next round</span>
                    </p>
                  ))}
                  {you.owedByPartners.map((t) => (
                    <p key={`b-${t.actor}`} className="text-sm text-emerald-400">
                      <span className="font-semibold">{t.actor}</span> has to pay you {money(t.amount)}
                    </p>
                  ))}
                  {you.withdrawalDebt > 0 && (
                    <p className="text-sm text-amber-400">
                      You owe Nexoryn {money(you.withdrawalDebt)} from personal withdrawals
                    </p>
                  )}
                </div>
              )}

              {you.owesToPartners.length === 0 && you.owedByPartners.length === 0 && you.withdrawalDebt === 0 && (
                <p className="mt-5 border-t border-white/5 pt-4 text-sm text-emerald-400/80">
                  You are all square — nothing owed either way.
                </p>
              )}
            </>
          ) : (
            <div className="flex items-center justify-between gap-4">
              <p className="text-sm text-white/50">
                No ledger position found for your account name yet — view the full team ledger on the Finance page.
              </p>
              <Wallet className="h-5 w-5 shrink-0 text-white/20" />
            </div>
          )}
        </Card>
      </div>

      {/* Recent contact submissions — second priority */}
      <div className="mb-8">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-white/50">Recent contact submissions</h2>
          <Link to="/contact-submissions" className="text-xs text-accent-to hover:underline">Open inbox →</Link>
        </div>
        <Card className="overflow-hidden">
          {recent.length === 0 ? (
            <p className="p-6 text-sm text-white/40">Nothing yet.</p>
          ) : (
            <div className="flex flex-col">
              {recent.map((s) => (
                <div key={s.id} className="flex items-center justify-between gap-4 border-b border-white/5 p-4 last:border-0">
                  <div className="min-w-0">
                    <p className="truncate text-sm text-white">{s.fields.name ?? "Unknown"} <span className="text-white/30">— {s.formId}</span></p>
                    <p className="text-xs text-white/40">{new Date(s.createdAt).toLocaleString()}</p>
                  </div>
                  <Badge tone={s.status === "new" ? "warning" : s.status === "handled" ? "success" : "neutral"}>{s.status}</Badge>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>

      {/* Secondary content stats — lower priority */}
      <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-white/50">Content</h2>
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <MiniStat label="Projects" value={stats.projects} icon={Briefcase} />
        <MiniStat label="Reviews" value={stats.reviews} icon={MessageSquareQuote} />
        <MiniStat label="Team Members" value={stats.team} icon={Users} />
        <MiniStat label="New Submissions" value={stats.newSubmissions} icon={Inbox} />
      </div>
    </div>
  );
}
