import { Router } from "express";
import { prisma } from "../../config/database";
import { authMiddleware } from "../../middleware/auth";
import { calculateFinanceDashboard } from "../../services/financeCalculations";
import { COMPANY_ACTOR, investmentInputSchema } from "../../services/validation";
import { asyncHandler } from "../../utils/asyncHandler";
import { ApiError } from "../../utils/errors";

const router = Router();
router.use(authMiddleware);

/** How much of `actor`'s personal withdrawals is still owed back to Nexoryn. */
async function outstandingWithdrawalDebt(actor: string): Promise<number> {
  const rows = await prisma.investment.findMany({
    where: {
      actionBy: actor,
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

// POST /api/v1/admin/finance/investments
router.post(
  "/investments",
  asyncHandler(async (req, res) => {
    const input = investmentInputSchema.parse(req.body);

    // `enteredBy` is the audit trail, so it comes from the session rather than
    // the request body — a client can't claim someone else logged the row.
    const admin = await prisma.adminUser.findUnique({ where: { id: req.admin!.id } });
    if (!admin) throw ApiError.notFound("Admin not found");

    // Repaying the company more than was withdrawn would quietly vanish: the
    // withdrawal debt floors at zero, so the excess is credited to nobody.
    // A peer overpayment is fine (it just flips the imbalance the other way
    // and shows up as a settlement back), so only the company case is capped.
    if (input.type === "debt_paid" && input.paidTo === COMPANY_ACTOR) {
      const outstanding = await outstandingWithdrawalDebt(input.actionBy);
      if (input.amount > outstanding + 0.005) {
        throw ApiError.badRequest(
          outstanding === 0
            ? `${input.actionBy} has no outstanding withdrawal to repay.`
            : `${input.actionBy} only owes the company ${outstanding.toFixed(2)}. Log the extra as an investment instead.`,
          { amount: `Cannot exceed ${outstanding.toFixed(2)}` },
        );
      }
    }

    const investment = await prisma.investment.create({
      data: {
        ...input,
        paidTo: input.paidTo ?? null,
        adminId: admin.id,
        enteredBy: admin.name,
      },
    });
    res.status(201).json(investment);
  }),
);

// DELETE /api/v1/admin/finance/investments/:id
router.delete(
  "/investments/:id",
  asyncHandler(async (req, res) => {
    await prisma.investment.delete({ where: { id: req.params.id } }).catch(() => {
      throw ApiError.notFound("Ledger entry not found");
    });
    res.status(204).send();
  }),
);

export default router;
