import { Router } from "express";
import { prisma } from "../../config/database";
import { authMiddleware } from "../../middleware/auth";
import { asyncHandler } from "../../utils/asyncHandler";

const router = Router();
router.use(authMiddleware);

// GET /api/v1/admin/admins — minimal directory (id/name/email only), used
// by the finance UI to pick a creditor for a debt_payment entry.
router.get(
  "/",
  asyncHandler(async (_req, res) => {
    const admins = await prisma.adminUser.findMany({
      select: { id: true, name: true, email: true },
      orderBy: { name: "asc" },
    });
    res.json({ items: admins });
  }),
);

export default router;
