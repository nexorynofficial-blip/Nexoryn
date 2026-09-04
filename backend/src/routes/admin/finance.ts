import { Router } from "express";
import { prisma } from "../../config/database";
import { authMiddleware } from "../../middleware/auth";
import { calculateFinanceDashboard } from "../../services/financeCalculations";
import {
  COMPANY_ACTOR,
  PARTNERS,
  decisionInputSchema,
  investmentInputSchema,
} from "../../services/validation";
import { asyncHandler } from "../../utils/asyncHandler";
import { ApiError } from "../../utils/errors";

const router = Router();
router.use(authMiddleware);

/** The caller's stable ledger identity (see AdminUser.partnerName). */
async function callerIdentity(adminId: string): Promise<{ id: string; name: string; actor: string }> {
  const admin = await prisma.adminUser.findUnique({ where: { id: adminId } });
  if (!admin) throw ApiError.notFound("Admin not found");
  return { id: admin.id, name: admin.name, actor: (admin.partnerName ?? admin.name).trim() };
}

/**
 * Who is allowed to decide a pending row.
 *
 * A partner-to-partner payment is a claim about a specific person's money, so
 * that person decides. A repayment to the company has no counterparty login,
 * so it falls to the other partners — excluding both the partner whose debt it
 * clears (they'd be approving their own benefit) and whoever logged it (so a
 * single person can never create and clear a row on their own).
 */
function eligibleApprovers(row: { type: string; paidTo: string | null; actionBy: string; enteredBy: string }): string[] {
  if (row.type !== "debt_paid") return [];
  if (row.paidTo && row.paidTo !== COMPANY_ACTOR) return [row.paidTo];
  return PARTNERS.filter((p) => p !== row.actionBy && p !== row.enteredBy);
}

/** How much of `actor`'s personal withdrawals is still owed back to Nexoryn. */
async function outstandingWithdrawalDebt(actor: string): Promise<number> {
  const rows = await prisma.investment.findMany({
    where: {
      actionBy: actor,
      // A pending repayment hasn't cleared anything yet, and a rejected one
      // never will — neither may reduce what this partner still owes, or a
      // second request could be raised against debt the first already claimed.
      approvalStatus: "approved",
      OR: [{ type: "personal_withdraw" }, { type: "debt_paid", paidTo: COMPANY_ACTOR }],
    },
    select: { amount: true, type: true },
  });
  const total = rows.reduce(
    (acc, r) => acc + (r.type === "personal_withdraw" ? Number(r.amount) : -Number(r.amount)),
    0,
  );
  return Math.max(0, Math.round(total * 100) / 100);
}

/** Repayments to the company already awaiting a decision, which the cap must
 *  also account for — otherwise two pending requests could each pass the check
 *  on their own and together exceed the real debt once both are approved. */
async function pendingCompanyRepayments(actor: string): Promise<number> {
  const rows = await prisma.investment.findMany({
    where: { actionBy: actor, type: "debt_paid", paidTo: COMPANY_ACTOR, approvalStatus: "pending" },
    select: { amount: true },
  });
  return Math.round(rows.reduce((acc, r) => acc + Number(r.amount), 0) * 100) / 100;
}

// GET /api/v1/admin/finance/dashboard — company totals, every partner's
// position, and the settlement plan. `you` is the caller's own row.
router.get(
  "/dashboard",
  asyncHandler(async (req, res) => {
    const dashboard = await calculateFinanceDashboard(req.admin!.id);
    res.json(dashboard);
  }),
);

// GET /api/v1/admin/finance/investments — the full shared ledger.
router.get(
  "/investments",
  asyncHandler(async (_req, res) => {
    const items = await prisma.investment.findMany({ orderBy: [{ date: "desc" }, { createdAt: "desc" }] });
    res.json({ items });
  }),
);

// GET /api/v1/admin/finance/requests — every debt payment that needed a
// decision, split by the caller's relationship to it.
//   incoming — waiting on YOU
//   outgoing — you logged it, waiting on someone else
//   history  — already decided, either direction
router.get(
  "/requests",
  asyncHandler(async (req, res) => {
    const me = await callerIdentity(req.admin!.id);

    const rows = await prisma.investment.findMany({
      where: { type: "debt_paid" },
      orderBy: [{ createdAt: "desc" }],
    });

    const withApprovers = rows.map((r) => ({ row: r, approvers: eligibleApprovers(r) }));
    const mine = withApprovers.filter(
      ({ row, approvers }) =>
        approvers.includes(me.actor) || row.actionBy === me.actor || row.enteredBy === me.actor,
    );

    const decorate = ({ row, approvers }: (typeof withApprovers)[number]) => ({
      ...row,
      amount: Number(row.amount),
      eligibleApprovers: approvers,
      canDecide: row.approvalStatus === "pending" && approvers.includes(me.actor),
    });

    res.json({
      you: me.actor,
      incoming: mine
        .filter(({ row, approvers }) => row.approvalStatus === "pending" && approvers.includes(me.actor))
        .map(decorate),
      outgoing: mine
        .filter(({ row, approvers }) => row.approvalStatus === "pending" && !approvers.includes(me.actor))
        .map(decorate),
      history: mine.filter(({ row }) => row.approvalStatus !== "pending").map(decorate),
    });
  }),
);

// POST /api/v1/admin/finance/investments
router.post(
  "/investments",
  asyncHandler(async (req, res) => {
    const input = investmentInputSchema.parse(req.body);

    // `enteredBy` is the audit trail, so it comes from the session rather than
    // the request body — a client can't claim someone else logged the row.
    const me = await callerIdentity(req.admin!.id);

    // Repaying the company more than was withdrawn would quietly vanish: the
    // withdrawal debt floors at zero, so the excess is credited to nobody.
    // A peer overpayment is fine (it just flips the imbalance the other way
    // and shows up as a settlement back), so only the company case is capped.
    if (input.type === "debt_paid" && input.paidTo === COMPANY_ACTOR) {
      const [outstanding, alreadyPending] = await Promise.all([
        outstandingWithdrawalDebt(input.actionBy),
        pendingCompanyRepayments(input.actionBy),
      ]);
      const room = Math.round((outstanding - alreadyPending) * 100) / 100;
      if (input.amount > room + 0.005) {
        throw ApiError.badRequest(
          room <= 0
            ? alreadyPending > 0
              ? `${input.actionBy}'s outstanding withdrawal is already covered by a repayment awaiting approval.`
              : `${input.actionBy} has no outstanding withdrawal to repay.`
            : `${input.actionBy} only owes the company ${room.toFixed(2)}${
                alreadyPending > 0 ? " once the repayment already awaiting approval is counted" : ""
              }. Log the extra as an investment instead.`,
          { amount: `Cannot exceed ${Math.max(0, room).toFixed(2)}` },
        );
      }
    }

    const needsApproval = input.type === "debt_paid";
    const approvers = needsApproval
      ? eligibleApprovers({
          type: input.type,
          paidTo: input.paidTo ?? null,
          actionBy: input.actionBy,
          enteredBy: me.actor,
        })
      : [];

    // A company repayment logged by one partner on behalf of another leaves
    // exactly one eligible approver; if some future actor list made that zero,
    // failing loudly beats silently creating a row nobody can ever decide.
    if (needsApproval && approvers.length === 0) {
      throw ApiError.badRequest("No one is available to approve this payment.");
    }

    const investment = await prisma.investment.create({
      data: {
        ...input,
        paidTo: input.paidTo ?? null,
        adminId: me.id,
        enteredBy: me.actor,
        approvalStatus: needsApproval ? "pending" : "approved",
      },
    });
    res.status(201).json({ ...investment, amount: Number(investment.amount), eligibleApprovers: approvers });
  }),
);

/** Shared guard for approve/reject: the row must exist, still be pending, and
 *  the caller must be one of its eligible approvers. */
async function loadDecidableRow(id: string, actor: string) {
  const row = await prisma.investment.findUnique({ where: { id } });
  if (!row) throw ApiError.notFound("Request not found");
  if (row.approvalStatus !== "pending") {
    throw ApiError.badRequest(`This request was already ${row.approvalStatus}.`);
  }
  if (!eligibleApprovers(row).includes(actor)) {
    throw ApiError.forbidden("This request isn't yours to decide.");
  }
  return row;
}

// POST /api/v1/admin/finance/investments/:id/approve
router.post(
  "/investments/:id/approve",
  asyncHandler(async (req, res) => {
    const { note } = decisionInputSchema.parse(req.body ?? {});
    const me = await callerIdentity(req.admin!.id);
    const row = await loadDecidableRow(req.params.id, me.actor);

    // Re-check the company cap at decision time: the debt may have moved since
    // the request was raised (another repayment approved in the meantime).
    if (row.paidTo === COMPANY_ACTOR) {
      const outstanding = await outstandingWithdrawalDebt(row.actionBy);
      if (Number(row.amount) > outstanding + 0.005) {
        throw ApiError.badRequest(
          `${row.actionBy} now only owes the company ${outstanding.toFixed(2)}, less than this request. Reject it and log a fresh one.`,
        );
      }
    }

    const updated = await prisma.investment.update({
      where: { id: row.id },
      data: {
        approvalStatus: "approved",
        decidedBy: me.actor,
        decidedAt: new Date(),
        decisionNote: note ?? null,
      },
    });
    res.json({ ...updated, amount: Number(updated.amount) });
  }),
);

// POST /api/v1/admin/finance/investments/:id/reject
router.post(
  "/investments/:id/reject",
  asyncHandler(async (req, res) => {
    const { note } = decisionInputSchema.parse(req.body ?? {});
    const me = await callerIdentity(req.admin!.id);
    const row = await loadDecidableRow(req.params.id, me.actor);

    const updated = await prisma.investment.update({
      where: { id: row.id },
      data: {
        approvalStatus: "rejected",
        decidedBy: me.actor,
        decidedAt: new Date(),
        decisionNote: note ?? null,
      },
    });
    res.json({ ...updated, amount: Number(updated.amount) });
  }),
);

// DELETE /api/v1/admin/finance/investments/:id
router.delete(
  "/investments/:id",
  asyncHandler(async (req, res) => {
    const row = await prisma.investment.findUnique({ where: { id: req.params.id } });
    if (!row) throw ApiError.notFound("Ledger entry not found");

    // A pending request belongs to the person who raised it — withdrawing it is
    // fine, but it must not be deletable by the approver as a silent
    // alternative to rejecting (which leaves a record).
    if (row.approvalStatus === "pending") {
      const me = await callerIdentity(req.admin!.id);
      if (row.enteredBy !== me.actor) {
        throw ApiError.forbidden("Only whoever raised this request can withdraw it. Reject it instead.");
      }
    }

    await prisma.investment.delete({ where: { id: row.id } });
    res.status(204).send();
  }),
);

export default router;
