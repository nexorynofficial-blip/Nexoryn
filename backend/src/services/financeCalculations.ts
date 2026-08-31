// Nexoryn finance model.
//
// The company is owned equally by three partners (PARTNERS in validation.ts).
// Everything below falls out of two rules:
//
//   1. CAPITAL IS SHARED IN THIRDS. Whatever the partners have put in, each
//      one is on the hook for a third of it. Put in more than your third and
//      the others owe you the difference; put in less and you owe them.
//      Example: 6000 / 4000 / 2000 -> total 12000, a third is 4000, so #1 is
//      owed 2000, #2 is square, #3 owes 2000.
//
//   2. PROFIT IS SHARED IN THIRDS. Each partner's profit share is a third of
//      everything the company has earned.
//
// A personal withdrawal is deliberately NOT netted off the company's invested
// total — that total records what went in, and taking money out later doesn't
// un-invest it. A withdrawal becomes a debt the partner owes the company, and
// only a `debt_paid` row pointed back at Nexoryn clears it. Keeping those two
// numbers separate is what stops the company total from drifting.
//
// Debt is settled either by a `debt_paid` row (peer-to-peer for a capital
// imbalance, or to Nexoryn for a withdrawal) or simply by investing more next
// time — an under-contributing partner's balance closes on its own as their
// `invested` rows catch up to their third.

import { prisma } from "../config/database";
import { COMPANY_ACTOR, PARTNERS } from "./validation";

type Partner = (typeof PARTNERS)[number];

/** Sub-cent noise from dividing by three shouldn't read as an open debt. */
const EPSILON = 0.005;

const round2 = (n: number) => Math.round(n * 100) / 100;

export interface Transfer {
  actor: string;
  amount: number;
}

export interface PartnerFinance {
  actor: Partner;
  /** Capital this partner has actually put in. */
  invested: number;
  /** Peer settlements paid out / taken in, which shift capital credit. */
  paidToPeers: number;
  receivedFromPeers: number;
  /** invested + paidToPeers - receivedFromPeers: their real capital credit. */
  effectiveInvested: number;
  /** A third of the partners' combined capital. */
  fairShare: number;
  /** effectiveInvested - fairShare. Positive = owed, negative = owes. */
  investmentBalance: number;
  /** A third of everything the company earned. */
  profitShare: number;
  /** Personal money taken out, and how much of it has been paid back. */
  withdrawn: number;
  repaidToCompany: number;
  /** Still owed to the company from personal withdrawals. */
  withdrawalDebt: number;
  /** effectiveInvested + profitShare - withdrawalDebt. */
  netPosition: number;
  /** Who this partner still needs to pay, and who still needs to pay them. */
  owesToPartners: Transfer[];
  owedByPartners: Transfer[];
  /** Convenience totals for the two lists above. */
  totalOwedToPartners: number;
  totalOwedByPartners: number;
}

export interface FinanceDashboard {
  company: {
    totalInvested: number;
    totalEarned: number;
    totalWithdrawn: number;
    totalRepaidToCompany: number;
    /** What should actually be sitting in the account. */
    cashPosition: number;
    fairSharePerPartner: number;
  };
  partners: PartnerFinance[];
  /** The minimum set of payments that would square everyone up. */
  settlements: { from: Partner; to: Partner; amount: number }[];
  /** The logged-in admin's own row, matched by name. */
  you: PartnerFinance | null;
}

interface LedgerRow {
  amount: unknown;
  type: string;
  actionBy: string;
  paidTo: string | null;
}

const isPartner = (name: string | null): name is Partner =>
  !!name && (PARTNERS as readonly string[]).includes(name);

/**
 * Smallest set of partner-to-partner payments that clears every imbalance:
 * repeatedly send from the largest debtor to the largest creditor. With only
 * three partners this is optimal, and it is deterministic because ties break
 * on the fixed PARTNERS order.
 */
function computeSettlements(
  balances: { actor: Partner; balance: number }[],
): { from: Partner; to: Partner; amount: number }[] {
  const debtors = balances
    .filter((b) => b.balance < -EPSILON)
    .map((b) => ({ actor: b.actor, remaining: -b.balance }))
    .sort((a, b) => b.remaining - a.remaining);
  const creditors = balances
    .filter((b) => b.balance > EPSILON)
    .map((b) => ({ actor: b.actor, remaining: b.balance }))
    .sort((a, b) => b.remaining - a.remaining);

  const out: { from: Partner; to: Partner; amount: number }[] = [];
  let d = 0;
  let c = 0;
  while (d < debtors.length && c < creditors.length) {
    const amount = Math.min(debtors[d].remaining, creditors[c].remaining);
    if (amount > EPSILON) {
      out.push({ from: debtors[d].actor, to: creditors[c].actor, amount: round2(amount) });
    }
    debtors[d].remaining -= amount;
    creditors[c].remaining -= amount;
    if (debtors[d].remaining <= EPSILON) d++;
    if (creditors[c].remaining <= EPSILON) c++;
  }
  return out;
}

export async function calculateFinanceDashboard(adminId: string): Promise<FinanceDashboard> {
  const [admin, rows] = await Promise.all([
    prisma.adminUser.findUnique({ where: { id: adminId } }),
    prisma.investment.findMany({ select: { amount: true, type: true, actionBy: true, paidTo: true } }),
  ]);

  const sum = (predicate: (r: LedgerRow) => boolean) =>
    rows.reduce((acc, r) => (predicate(r) ? acc + Number(r.amount) : acc), 0);

  // ── Company-level totals ───────────────────────────────────────────────
  // Capital only counts toward the three-way split when a partner put it in;
  // a row booked against Nexoryn is company money with no partner claim on it.
  const partnerInvested = sum((r) => r.type === "invested" && isPartner(r.actionBy));
  const companyInvested = sum((r) => r.type === "invested" && r.actionBy === COMPANY_ACTOR);
  const totalInvested = partnerInvested + companyInvested;
  const totalEarned = sum((r) => r.type === "earned");
  const totalWithdrawn = sum((r) => r.type === "personal_withdraw");
  const totalRepaidToCompany = sum((r) => r.type === "debt_paid" && r.paidTo === COMPANY_ACTOR);

  const fairShare = partnerInvested / PARTNERS.length;
  const profitShare = totalEarned / PARTNERS.length;

  // ── Per-partner ────────────────────────────────────────────────────────
  const base = PARTNERS.map((actor) => {
    const invested = sum((r) => r.type === "invested" && r.actionBy === actor);
    const paidToPeers = sum((r) => r.type === "debt_paid" && r.actionBy === actor && isPartner(r.paidTo));
    const receivedFromPeers = sum((r) => r.type === "debt_paid" && r.paidTo === actor && isPartner(r.actionBy));
    const withdrawn = sum((r) => r.type === "personal_withdraw" && r.actionBy === actor);
    const repaidToCompany = sum(
      (r) => r.type === "debt_paid" && r.actionBy === actor && r.paidTo === COMPANY_ACTOR,
    );

    // Settling up with a peer moves capital credit from the payee to the
    // payer, which is exactly what closes the imbalance between them.
    const effectiveInvested = invested + paidToPeers - receivedFromPeers;
    const withdrawalDebt = Math.max(0, withdrawn - repaidToCompany);

    return {
      actor,
      invested: round2(invested),
      paidToPeers: round2(paidToPeers),
      receivedFromPeers: round2(receivedFromPeers),
      effectiveInvested: round2(effectiveInvested),
      fairShare: round2(fairShare),
      investmentBalance: round2(effectiveInvested - fairShare),
      profitShare: round2(profitShare),
      withdrawn: round2(withdrawn),
      repaidToCompany: round2(repaidToCompany),
      withdrawalDebt: round2(withdrawalDebt),
      netPosition: round2(effectiveInvested + profitShare - withdrawalDebt),
    };
  });

  // Dividing by three rarely lands on whole cents, and rounding each balance
  // on its own leaves a stray cent or two that the settlement plan can never
  // pay off — one partner would sit at "owed $0.01" forever. Push the residue
  // onto the largest balance so the three always net to exactly zero.
  const residue = round2(base.reduce((a, p) => a + p.investmentBalance, 0));
  if (residue !== 0) {
    const target = base.reduce(
      (best, p, i) => (Math.abs(p.investmentBalance) > Math.abs(base[best].investmentBalance) ? i : best),
      0,
    );
    base[target].investmentBalance = round2(base[target].investmentBalance - residue);
  }

  const settlements = computeSettlements(
    base.map((p) => ({ actor: p.actor, balance: p.investmentBalance })),
  );

  const partners: PartnerFinance[] = base.map((p) => {
    const owesToPartners = settlements
      .filter((s) => s.from === p.actor)
      .map((s) => ({ actor: s.to, amount: s.amount }));
    const owedByPartners = settlements
      .filter((s) => s.to === p.actor)
      .map((s) => ({ actor: s.from, amount: s.amount }));
    return {
      ...p,
      owesToPartners,
      owedByPartners,
      totalOwedToPartners: round2(owesToPartners.reduce((a, t) => a + t.amount, 0)),
      totalOwedByPartners: round2(owedByPartners.reduce((a, t) => a + t.amount, 0)),
    };
  });

  const you =
    partners.find((p) => admin && p.actor.toLowerCase() === admin.name.trim().toLowerCase()) ?? null;

  return {
    company: {
      totalInvested: round2(totalInvested),
      totalEarned: round2(totalEarned),
      totalWithdrawn: round2(totalWithdrawn),
      totalRepaidToCompany: round2(totalRepaidToCompany),
      cashPosition: round2(totalInvested + totalEarned - totalWithdrawn + totalRepaidToCompany),
      fairSharePerPartner: round2(fairShare),
    },
    partners,
    settlements,
    you,
  };
}
