import { Router } from "express";
import { prisma } from "../../config/database";
import { authMiddleware } from "../../middleware/auth";
import { accountPasswordSchema, accountProfileSchema } from "../../services/validation";
import { asyncHandler } from "../../utils/asyncHandler";
import { ApiError } from "../../utils/errors";
import { SESSION_COOKIE_NAME, sessionCookieOptions, signAdminToken } from "../../utils/jwt";
import { hashPassword, verifyPassword } from "../../utils/password";

const router = Router();
router.use(authMiddleware);

/** The shape every route here returns — never includes passwordHash. */
const publicView = (a: {
  id: string;
  email: string;
  name: string;
  partnerName: string | null;
  role: string;
  createdAt: Date;
  lastLoginAt: Date | null;
}) => ({
  id: a.id,
  email: a.email,
  name: a.name,
  partnerName: a.partnerName,
  role: a.role,
  createdAt: a.createdAt,
  lastLoginAt: a.lastLoginAt,
});

// GET /api/v1/admin/account
router.get(
  "/",
  asyncHandler(async (req, res) => {
    const admin = await prisma.adminUser.findUnique({ where: { id: req.admin!.id } });
    if (!admin) throw ApiError.notFound("Admin not found");
    res.json(publicView(admin));
  }),
);

// PATCH /api/v1/admin/account — change the display name.
//
// Deliberately cannot touch `partnerName`: that is the identity the finance
// ledger is keyed to, and letting it drift would detach this account from its
// own investments, debts and approval rights. Display name is cosmetic.
router.patch(
  "/",
  asyncHandler(async (req, res) => {
    const { name } = accountProfileSchema.parse(req.body);
    const admin = await prisma.adminUser.update({
      where: { id: req.admin!.id },
      data: { name },
    });
    res.json(publicView(admin));
  }),
);

// POST /api/v1/admin/account/password
router.post(
  "/password",
  asyncHandler(async (req, res) => {
    const { currentPassword, newPassword } = accountPasswordSchema.parse(req.body);

    const admin = await prisma.adminUser.findUnique({ where: { id: req.admin!.id } });
    if (!admin) throw ApiError.notFound("Admin not found");

    // Knowing the current password is what makes this a password *change*
    // rather than a session-hijack escalation.
    const valid = await verifyPassword(currentPassword, admin.passwordHash);
    if (!valid) {
      throw ApiError.badRequest("Current password is incorrect", {
        currentPassword: "Incorrect password",
      });
    }

    await prisma.adminUser.update({
      where: { id: admin.id },
      data: { passwordHash: await hashPassword(newPassword) },
    });

    // Re-issue the session cookie so the admin stays logged in on this device
    // after the change (the old token is still valid until it expires — see
    // the known gap in docs/DEPLOYMENT.md about there being no token
    // revocation list in v1).
    const token = signAdminToken({ id: admin.id, email: admin.email });
    res.cookie(SESSION_COOKIE_NAME, token, sessionCookieOptions);

    res.json({ ok: true, token });
  }),
);

export default router;
