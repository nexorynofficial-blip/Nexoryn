import { useEffect, useState } from "react";
import { ArrowRight, Building2, Download, Mail, Plus, Trash2 } from "lucide-react";
import { api, ApiRequestError } from "../lib/api";
import { useAuth } from "../hooks/useAuth";
import type { FinanceDashboardData, Investment, LedgerActor, LedgerType, PartnerFinance } from "../types";
import {
  COMPANY_ACTOR,
  LEDGER_ACTORS,
  LEDGER_TYPES,
  LEDGER_TYPE_HINTS,
  LEDGER_TYPE_LABELS,
  PARTNERS,
} from "../lib/constants";
import { Badge, Button, Card, ErrorBanner, Field, Input, PageHeader, Select, Spinner } from "../components/ui";

const money = (n: number) =>
  n.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 2 });

function Stat({ label, value, tone = "default", hint }: { label: string; value: string; tone?: "default" | "good" | "bad" | "accent"; hint?: string }) {
  const tones = {
    default: "text-white",
    good: "text-emerald-400",
    bad: "text-red-400",
    accent: "text-accent-to",
  };
  return (
    <div>
      <p className="text-[11px] uppercase tracking-wide text-white/40">{label}</p>
      <p className={`mt-1 text-lg font-semibold ${tones[tone]}`}>{value}</p>
      {hint && <p className="mt-0.5 text-[11px] text-white/30">{hint}</p>}
    </div>
  );
}

/** The two settlement lists — who this partner pays, and who pays them. */
function SettlementLines({ partner }: { partner: PartnerFinance }) {
  const nothing = partner.owesToPartners.length === 0 && partner.owedByPartners.length === 0 && partner.withdrawalDebt === 0;
  if (nothing) {
    return <p className="text-xs text-emerald-400/80">All square — nothing owed either way.</p>;
  }
  return (
    <div className="flex flex-col gap-1.5">
      {partner.owesToPartners.map((t) => (
        <p key={`owe-${t.actor}`} className="text-xs text-red-400">
          Pays <span className="font-semibold">{t.actor}</span> {money(t.amount)}
          <span className="text-white/30"> · or just invest that much next round</span>
        </p>
      ))}
      {partner.owedByPartners.map((t) => (
        <p key={`owed-${t.actor}`} className="text-xs text-emerald-400">
          <span className="font-semibold">{t.actor}</span> owes them {money(t.amount)}
        </p>
      ))}
      {partner.withdrawalDebt > 0 && (
        <p className="text-xs text-amber-400">
          Owes Nexoryn {money(partner.withdrawalDebt)} from personal withdrawals
        </p>
      )}
    </div>
  );
}

function PartnerCard({ partner, highlight }: { partner: PartnerFinance; highlight?: boolean }) {
  const balance = partner.investmentBalance;
  return (
    <Card className={`p-5 ${highlight ? "border-accent-from/50 ring-1 ring-accent-from/20" : ""}`}>
      <div className="mb-4 flex items-center justify-between gap-2">
        <p className="text-sm font-semibold text-white">{partner.actor}</p>
        {balance > 0 ? (
          <Badge tone="success">Owed {money(balance)}</Badge>
        ) : balance < 0 ? (
          <Badge tone="danger">Short {money(-balance)}</Badge>
        ) : (
          <Badge tone="neutral">Settled</Badge>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Stat label="Invested" value={money(partner.invested)} hint={`Equal share ${money(partner.fairShare)}`} />
        <Stat label="Profit share" value={money(partner.profitShare)} />
        <Stat
          label="In debt"
          value={money(partner.totalOwedToPartners + partner.withdrawalDebt)}
          tone={partner.totalOwedToPartners + partner.withdrawalDebt > 0 ? "bad" : "default"}
        />
        <Stat label="Net position" value={money(partner.netPosition)} tone="accent" />
      </div>

      <div className="mt-4 border-t border-white/5 pt-3">
        <SettlementLines partner={partner} />
      </div>
    </Card>
  );
}

export default function Finance() {
  const { user } = useAuth();
  const [dashboard, setDashboard] = useState<FinanceDashboardData | null>(null);
  const [investments, setInvestments] = useState<Investment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [amount, setAmount] = useState("");
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [description, setDescription] = useState("");
  const [type, setType] = useState<LedgerType>("invested");
  const [actionBy, setActionBy] = useState<LedgerActor>(PARTNERS[0]);
  const [paidTo, setPaidTo] = useState<LedgerActor | "">("");
  const [saving, setSaving] = useState(false);

  const [reportYear, setReportYear] = useState(new Date().getFullYear());
  const [reportMonth, setReportMonth] = useState(new Date().getMonth() + 1);
  const [emailing, setEmailing] = useState(false);
  const [reportMessage, setReportMessage] = useState("");

  // Default "Action by" to whoever is logged in, when they are a partner.
  useEffect(() => {
    const match = PARTNERS.find((p) => p.toLowerCase() === (user?.name ?? "").trim().toLowerCase());
    if (match) setActionBy(match);
  }, [user?.name]);

  const load = () => {
    setLoading(true);
    Promise.all([
      api.get<FinanceDashboardData>("/api/v1/admin/finance/dashboard"),
      api.get<{ items: Investment[] }>("/api/v1/admin/finance/investments"),
    ])
      .then(([dash, inv]) => {
        setDashboard(dash);
        setInvestments(inv.items);
      })
      .catch((err) => setError(err instanceof ApiRequestError ? err.message : "Failed to load finance data"))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const handleAddEntry = async () => {
    if (!amount || !description) return setError("Amount and description are required.");
    if (type === "debt_paid" && !paidTo) return setError("Choose who is being repaid.");
    setSaving(true);
    setError("");
    try {
      await api.post("/api/v1/admin/finance/investments", {
        amount: Number(amount),
        date,
        description,
        type,
        actionBy,
        paidTo: type === "debt_paid" ? paidTo : undefined,
      });
      setAmount("");
      setDescription("");
      setPaidTo("");
      load();
    } catch (err) {
      setError(err instanceof ApiRequestError ? err.message : "Failed to add entry");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteEntry = async (id: string) => {
    try {
      await api.delete(`/api/v1/admin/finance/investments/${id}`);
      load();
    } catch (err) {
      setError(err instanceof ApiRequestError ? err.message : "Delete failed");
    }
  };

  const handleDownload = () => {
    window.open(`${api.baseUrl}/api/v1/admin/reports/download/${reportYear}/${reportMonth}`, "_blank");
  };

  const handleEmail = async () => {
    setEmailing(true);
    setReportMessage("");
    try {
      const res = await api.post<{ to: string }>("/api/v1/admin/reports/email", { year: reportYear, month: reportMonth });
      setReportMessage(`Sent to ${res.to}`);
    } catch (err) {
      setReportMessage(err instanceof ApiRequestError ? err.message : "Failed to send");
    } finally {
      setEmailing(false);
    }
  };

  if (loading || !dashboard) return <Spinner />;

  const { company, partners, settlements, you } = dashboard;
  // A partner can only repay another partner, or the company.
  const paidToOptions = LEDGER_ACTORS.filter((a) => a !== actionBy);

  return (
    <div>
      <PageHeader
        title="Finance"
        description="Capital and profit are split three ways. Everything below is calculated from the ledger."
      />
      <ErrorBanner message={error} />

      {/* Company-level totals */}
      <Card className="mb-6 p-6">
        <div className="mb-4 flex items-center gap-2">
          <Building2 className="h-4 w-4 text-accent-from" />
          <h2 className="text-sm font-semibold text-white">Company</h2>
        </div>
        <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-5">
          <Stat label="Total invested" value={money(company.totalInvested)} />
          <Stat label="Total earned" value={money(company.totalEarned)} />
          <Stat
            label="Withdrawals out"
            value={money(company.totalWithdrawn - company.totalRepaidToCompany)}
            tone={company.totalWithdrawn - company.totalRepaidToCompany > 0 ? "bad" : "default"}
            hint="Owed back to the company"
          />
          <Stat label="Cash position" value={money(company.cashPosition)} tone="accent" />
          <Stat label="Equal share each" value={money(company.fairSharePerPartner)} hint="Total invested ÷ 3" />
        </div>
      </Card>

      {/* Settlement plan */}
      <Card className="mb-6 p-6">
        <h2 className="mb-3 text-sm font-semibold text-white">To settle up</h2>
        {settlements.length === 0 ? (
          <p className="text-sm text-emerald-400/80">Everyone has put in their equal share. Nothing to settle.</p>
        ) : (
          <div className="flex flex-col gap-2">
            {settlements.map((s, i) => (
              <div key={i} className="flex items-center gap-3 text-sm">
                <span className="font-medium text-white">{s.from}</span>
                <ArrowRight className="h-3.5 w-3.5 text-white/30" />
                <span className="font-medium text-white">{s.to}</span>
                <span className="ml-auto font-semibold text-accent-to">{money(s.amount)}</span>
              </div>
            ))}
            <p className="mt-2 text-xs text-white/40">
              Or the partner who is short can simply invest the difference next round — the gap closes either way.
            </p>
          </div>
        )}
      </Card>

      {you && (
        <div className="mb-6">
          <p className="mb-2 text-xs font-medium uppercase tracking-wide text-white/40">Your position</p>
          <PartnerCard partner={you} highlight />
        </div>
      )}

      <p className="mb-2 text-xs font-medium uppercase tracking-wide text-white/40">All partners</p>
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        {partners.map((p) => (
          <PartnerCard key={p.actor} partner={p} />
        ))}
      </div>

      <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card className="p-6">
          <h2 className="mb-4 text-sm font-semibold text-white">Add ledger entry</h2>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Amount">
              <Input type="number" step="0.01" min="0" value={amount} onChange={(e) => setAmount(e.target.value)} />
            </Field>
            <Field label="Date">
              <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
            </Field>
            <Field label="Type">
              <Select
                value={type}
                onChange={(e) => {
                  setType(e.target.value as LedgerType);
                  setPaidTo("");
                }}
              >
                {LEDGER_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {LEDGER_TYPE_LABELS[t]}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label="Action by">
              <Select value={actionBy} onChange={(e) => setActionBy(e.target.value as LedgerActor)}>
                {LEDGER_ACTORS.map((a) => (
                  <option key={a} value={a}>
                    {a}
                  </option>
                ))}
              </Select>
            </Field>
          </div>

          <p className="mt-2 text-xs text-white/40">{LEDGER_TYPE_HINTS[type]}</p>

          {type === "debt_paid" && (
            <div className="mt-3">
              <Field label="Paid to">
                <Select value={paidTo} onChange={(e) => setPaidTo(e.target.value as LedgerActor)}>
                  <option value="">Select who is being repaid…</option>
                  {paidToOptions.map((a) => (
                    <option key={a} value={a}>
                      {a === COMPANY_ACTOR ? `${a} (clears a personal withdrawal)` : `${a} (closes a capital gap)`}
                    </option>
                  ))}
                </Select>
              </Field>
            </div>
          )}

          <div className="mt-3">
            <Field label="Description">
              <Input value={description} onChange={(e) => setDescription(e.target.value)} />
            </Field>
          </div>

          <div className="mt-3">
            <Field label="Entered by">
              <Input value={user?.name ?? ""} readOnly disabled className="cursor-not-allowed opacity-60" />
            </Field>
            <p className="mt-1 text-[11px] text-white/30">Recorded automatically from your login.</p>
          </div>

          <Button className="mt-4 w-full" onClick={handleAddEntry} loading={saving}>
            <Plus className="h-4 w-4" /> Add Entry
          </Button>
        </Card>

        <Card className="p-6">
          <h2 className="mb-4 text-sm font-semibold text-white">Monthly report</h2>
          <div className="flex gap-3">
            <Field label="Year">
              <Input type="number" value={reportYear} onChange={(e) => setReportYear(Number(e.target.value))} />
            </Field>
            <Field label="Month">
              <Input type="number" min={1} max={12} value={reportMonth} onChange={(e) => setReportMonth(Number(e.target.value))} />
            </Field>
          </div>
          <div className="mt-4 flex flex-wrap gap-3">
            <Button variant="secondary" onClick={handleDownload}>
              <Download className="h-4 w-4" /> Download PDF
            </Button>
            <Button variant="secondary" onClick={handleEmail} loading={emailing}>
              <Mail className="h-4 w-4" /> Email to me
            </Button>
          </div>
          {reportMessage && <p className="mt-3 text-xs text-white/50">{reportMessage}</p>}
        </Card>
      </div>

      <Card className="mt-6 overflow-hidden">
        <h2 className="p-4 pb-0 text-sm font-semibold text-white">Ledger</h2>
        <div className="overflow-x-auto">
          <table className="mt-2 w-full text-sm">
            <thead>
              <tr className="border-b border-white/5 text-left text-xs uppercase tracking-wide text-white/40">
                <th className="p-4">Date</th>
                <th className="p-4">Type</th>
                <th className="p-4">Description</th>
                <th className="p-4">Action by</th>
                <th className="p-4">Paid to</th>
                <th className="p-4">Entered by</th>
                <th className="p-4 text-right">Amount</th>
                <th className="p-4" />
              </tr>
            </thead>
            <tbody>
              {investments.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-6 text-center text-white/40">
                    No entries yet.
                  </td>
                </tr>
              ) : (
                investments.map((inv) => (
                  <tr key={inv.id} className="border-b border-white/5 last:border-0 hover:bg-white/[0.02]">
                    <td className="whitespace-nowrap p-4 text-white/60">{new Date(inv.date).toLocaleDateString()}</td>
                    <td className="whitespace-nowrap p-4 text-white/70">{LEDGER_TYPE_LABELS[inv.type]}</td>
                    <td className="p-4 text-white/80">{inv.description}</td>
                    <td className="whitespace-nowrap p-4 text-white/60">{inv.actionBy}</td>
                    <td className="whitespace-nowrap p-4 text-white/60">{inv.paidTo ?? "—"}</td>
                    <td className="whitespace-nowrap p-4 text-white/40">{inv.enteredBy}</td>
                    <td className="whitespace-nowrap p-4 text-right text-white">{money(Number(inv.amount))}</td>
                    <td className="p-4 text-right">
                      <button onClick={() => handleDeleteEntry(inv.id)} className="text-white/30 hover:text-red-400">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
