import { Router } from "express";
import { prisma } from "../../config/database";
import { authMiddleware } from "../../middleware/auth";
import { asyncHandler } from "../../utils/asyncHandler";

const router = Router();
router.use(authMiddleware);

// GET /api/v1/admin/notifications?limit=20 — newest first. This is the
// bell's feed, and the one place history survives regardless of whether
// push ever worked for this admin.
router.get(
  "/",
  asyncHandler(async (req, res) => {
    const limit = Math.min(100, Math.max(1, Number(req.query.limit) || 20));
    const items = await prisma.notification.findMany({
      where: { adminId: req.admin!.id },
      orderBy: { createdAt: "desc" },
      take: limit,
    });
    const unreadCount = await prisma.notification.count({
      where: { adminId: req.admin!.id, isRead: false },
    });
    res.json({ items, unreadCount });
  }),
);

// POST /api/v1/admin/notifications/:id/read
router.post(
  "/:id/read",
  asyncHandler(async (req, res) => {
    await prisma.notification.updateMany({
      where: { id: req.params.id, adminId: req.admin!.id },
      data: { isRead: true },
    });
    res.status(204).send();
  }),
);

// POST /api/v1/admin/notifications/read-all — opening the bell marks
// everything currently visible as read in one call rather than one per row.
router.post(
  "/read-all",
  asyncHandler(async (req, res) => {
    await prisma.notification.updateMany({
      where: { adminId: req.admin!.id, isRead: false },
      data: { isRead: true },
    });
    res.status(204).send();
  }),
);

export default router;
