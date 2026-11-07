import { Router } from "express";
import { env } from "../../config/env";
import { asyncHandler } from "../../utils/asyncHandler";

const router = Router();

// GET /api/v1/push/vapid-public-key — no auth: this key is meant to be
// public (it's what pushManager.subscribe() hands to the push service so
// *it* can verify messages are signed by the matching private key — reading
// it tells a caller nothing it couldn't already see in the admin bundle).
// Served from the backend instead of baked into the admin build so the
// frontend never needs its own copy of the key to keep in sync.
router.get(
  "/vapid-public-key",
  asyncHandler(async (_req, res) => {
    res.json({ publicKey: env.vapidPublicKey || null });
  }),
);

export default router;
