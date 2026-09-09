import type { Response } from "express";
import { Router } from "express";
import { prisma } from "../../config/database";
import { authMiddleware } from "../../middleware/auth";
import { passkeyRateLimiter } from "../../middleware/rateLimiter";
import { recordAudit } from "../../services/audit";
import { generatePasskey, hashPasskey, verifyActionPasskey } from "../../services/passkey";
import { isBreachedPassword } from "../../services/passwordBreach";
import {
  accountPasswordSchema,
  accountProfileSchema,
  passkeyRegenerateSchema,
} from "../../services/validation";
import { asyncHandler } from "../../utils/asyncHandler";
import { ApiError } from "../../utils/errors";
import { SESSION_COOKIE_NAME, sessionCookieOptions, signAdminToken } from "../../utils/jwt";
import { hashPassword, verifyPassword } from "../../utils/password";

const router = Router();
router.use(authMiddleware);

/** The shape every route here returns — never includes passwordHash or the
 *  passkey hash. */
const publicView = (a: {
  id: string;
  email: string;
  name: string;
  partnerName: string | null;
  role: string;
  createdAt: Date;
  lastLoginAt: Date | null;
  actionPasskeyHash: string | null;
  actionPasskeySetAt: Date | null;
}) => ({
  id: a.id,
  email: a.email,
  name: a.name,
  partnerName: a.partnerName,
  role: a.role,
  createdAt: a.createdAt,
  lastLoginAt: a.lastLoginAt,
  hasPasskey: a.actionPasskeyHash !== null,
  passkeySetAt: a.actionPasskeySetAt,
});

/**
 * Revokes every session on the account and issues a fresh cookie for the
 * device doing the revoking, so signing everything out does not sign *you* out
 * mid-action.
 *
 * The one-second backdate closes a race: sessionsValidFrom is compared against
 * the token's `iat`, which JWT records in whole seconds. If the clock crosses a
 * second boundary between this update and signing the replacement, the new
 * token would look older than the cut-off and be rejected on the very next
 * request. A second of slack is far shorter than any useful attack window and
 * removes the flakiness entirely.
 */
async function revokeOtherSessions(adminId: string, email: string, res: Response) {
  await prisma.adminUser.update({
    where: { id: adminId },
    data: { sessionsValidFrom: new Date(Date.now() - 1000) },
  });
  res.cookie(SESSION_COOKIE_NAME, signAdminToken({ id: adminId, email }), sessionCookieOptions);
}

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
    await recordAudit({
      action: "account.profile_updated",
      actor: admin.name,
      adminId: admin.id,
      req,
    });
    res.json(publicView(admin));
  }),
);

// POST /api/v1/admin/account/password
router.post(
  "/password",
  passkeyRateLimiter,
  asyncHandler(async (req, res) => {
    const { currentPassword, newPassword, passkey } = accountPasswordSchema.parse(req.body);

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

    // A second, independent secret before a session cookie alone can change
    // the password — see services/passkey.ts.
    await verifyActionPasskey({ id: admin.id, name: admin.name }, passkey, req);

    // Rules alone can't tell "Tr0ub4dor&3" from a string that has appeared in
    // a hundred breaches and therefore sits in every cracking wordlist. Only
    // the password's own SHA-1 prefix is sent; see services/passwordBreach.ts.
    if (await isBreachedPassword(newPassword)) {
      throw ApiError.badRequest("That password has appeared in a known data breach", {
        newPassword: "Found in a known breach — please choose a different one",
      });
    }

    await prisma.adminUser.update({
      where: { id: admin.id },
      data: { passwordHash: await hashPassword(newPassword) },
    });

    // Changing a password is how someone responds to believing their account is
    // compromised, so it has to end any session they did not start — every
    // other device is signed out, and this one gets a fresh token.
    await revokeOtherSessions(admin.id, admin.email, res);

    await recordAudit({
      action: "account.password_changed",
      actor: admin.name,
      adminId: admin.id,
      req,
    });

    res.json({ ok: true });
  }),
);

// ── Action passkey ───────────────────────────────────────────────────────

// POST /api/v1/admin/account/passkey/setup — first-time generation only.
// Rejects if one already exists; use /passkey/regenerate to replace it.
router.post(
  "/passkey/setup",
  asyncHandler(async (req, res) => {
    const admin = await prisma.adminUser.findUnique({ where: { id: req.admin!.id } });
    if (!admin) throw ApiError.notFound("Admin not found");
    if (admin.actionPasskeyHash) {
      throw ApiError.badRequest(
        "A passkey is already set up for this account. Use regenerate to replace it.",
      );
    }

    const passkey = generatePasskey();
    await prisma.adminUser.update({
      where: { id: admin.id },
      data: { actionPasskeyHash: await hashPasskey(passkey), actionPasskeySetAt: new Date() },
    });

    await recordAudit({ action: "account.passkey_generated", actor: admin.name, adminId: admin.id, req });

    // Shown exactly once — the server keeps only the hash, so this response is
    // the only chance to see it.
    res.json({ passkey });
  }),
);

// POST /api/v1/admin/account/passkey/regenerate — replaces an existing
// passkey, e.g. when it's been forgotten. Proven by the account password
// rather than the passkey itself, since that would be circular.
router.post(
  "/passkey/regenerate",
  asyncHandler(async (req, res) => {
    const { password } = passkeyRegenerateSchema.parse(req.body);

    const admin = await prisma.adminUser.findUnique({ where: { id: req.admin!.id } });
    if (!admin) throw ApiError.notFound("Admin not found");

    if (!(await verifyPassword(password, admin.passwordHash))) {
      throw ApiError.badRequest("Password is incorrect", { password: "Incorrect password" });
    }

    const passkey = generatePasskey();
    await prisma.adminUser.update({
      where: { id: admin.id },
      data: { actionPasskeyHash: await hashPasskey(passkey), actionPasskeySetAt: new Date() },
    });

    await recordAudit({
      action: "account.passkey_regenerated",
      actor: admin.name,
      adminId: admin.id,
      req,
    });

    res.json({ passkey });
  }),
);

export default router;
