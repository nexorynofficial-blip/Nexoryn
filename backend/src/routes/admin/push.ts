import { Router } from "express";
import { z } from "zod";
import { prisma } from "../../config/database";
import { authMiddleware } from "../../middleware/auth";
import { asyncHandler } from "../../utils/asyncHandler";
import { ApiError } from "../../utils/errors";

const router = Router();
router.use(authMiddleware);

const subscribeSchema = z.object({
  endpoint: z.string().url(),
  keys: z.object({
    p256dh: z.string().min(1),
    auth: z.string().min(1),
  }),
  deviceLabel: z.string().max(100).optional(),
});

// POST /api/v1/admin/push/subscribe — upsert on endpoint: re-subscribing the
// same browser (e.g. after a permission re-prompt) replaces its row rather
// than erroring or duplicating, and re-attaches it to whoever is currently
// logged in, in case a shared machine switched admins without unsubscribing
// first.
router.post(
  "/subscribe",
  asyncHandler(async (req, res) => {
    const input = subscribeSchema.parse(req.body);
    const subscription = await prisma.pushSubscription.upsert({
      where: { endpoint: input.endpoint },
      create: {
        adminId: req.admin!.id,
        endpoint: input.endpoint,
        p256dh: input.keys.p256dh,
        auth: input.keys.auth,
        deviceLabel: input.deviceLabel,
      },
      update: {
        adminId: req.admin!.id,
        p256dh: input.keys.p256dh,
        auth: input.keys.auth,
        deviceLabel: input.deviceLabel,
        lastSeenAt: new Date(),
      },
    });
    res.status(201).json({ id: subscription.id });
  }),
);

// DELETE /api/v1/admin/push/subscribe?endpoint=... — called when the admin
// explicitly disables notifications, or when the browser's own
// pushManager.subscription becomes null on load (permission revoked).
router.delete(
  "/subscribe",
  asyncHandler(async (req, res) => {
    const endpoint = typeof req.query.endpoint === "string" ? req.query.endpoint : undefined;
    if (!endpoint) throw ApiError.badRequest("endpoint is required");
    // Scoped to the caller's own subscriptions — an admin can only remove a
    // device that is (or was) theirs, not guess another admin's endpoint.
    await prisma.pushSubscription.deleteMany({ where: { endpoint, adminId: req.admin!.id } });
    res.status(204).send();
  }),
);

// GET /api/v1/admin/push/devices — lets Account settings list/remove
// *other* devices too (e.g. an old phone that's no longer around to click
// "disable" on itself).
router.get(
  "/devices",
  asyncHandler(async (req, res) => {
    const items = await prisma.pushSubscription.findMany({
      where: { adminId: req.admin!.id },
      select: { id: true, endpoint: true, deviceLabel: true, createdAt: true, lastSeenAt: true },
      orderBy: { lastSeenAt: "desc" },
    });
    res.json({ items });
  }),
);

router.delete(
  "/devices/:id",
  asyncHandler(async (req, res) => {
    await prisma.pushSubscription.deleteMany({ where: { id: req.params.id, adminId: req.admin!.id } });
    res.status(204).send();
  }),
);

export default router;
