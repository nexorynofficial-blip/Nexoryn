import type { Response } from "express";
import { Router } from "express";
import { prisma } from "../../config/database";
import { authMiddleware } from "../../middleware/auth";
import { recordAudit } from "../../services/audit";
import {
  buildOtpAuthUri,
  generateMfaSecret,
  generateRecoveryCodes,
  hashRecoveryCodes,
  verifyTotp,
} from "../../services/mfa";
import { isBreachedPassword } from "../../services/passwordBreach";
import {
  accountPasswordSchema,
  accountProfileSchema,
  mfaCodeSchema,
  mfaDisableSchema,
} from "../../services/validation";
import { asyncHandler } from "../../utils/asyncHandler";
import { ApiError } from "../../utils/errors";
import { SESSION_COOKIE_NAME, sessionCookieOptions, signAdminToken } from "../../utils/jwt";
import { hashPassword, verifyPassword } from "../../utils/password";

const router = Router();
router.use(authMiddleware);

/** The shape every route here returns — never includes passwordHash, the MFA
 *  secret, or the recovery codes. */
const publicView = (a: {
  id: string;
  email: string;
  name: string;
  partnerName: string | null;
  role: string;
  createdAt: Date;
  lastLoginAt: Date | null;
  mfaEnabledAt: Date | null;
  mfaRecoveryCodes: string[];
}) => ({
  id: a.id,
  email: a.email,
  name: a.name,
  partnerName: a.partnerName,
  role: a.role,
  createdAt: a.createdAt,
  lastLoginAt: a.lastLoginAt,
  mfaEnabled: a.mfaEnabledAt !== null,
  mfaEnabledAt: a.mfaEnabledAt,
  recoveryCodesRemaining: a.mfaRecoveryCodes.length,
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

// ── Two-factor authentication ───────────────────────────────────────────────

// POST /api/v1/admin/account/mfa/setup — begin enrolment.
//
// Stores the secret but leaves MFA off (mfaEnabledAt stays null) until a code
// is proven in /mfa/enable. Abandoning setup halfway therefore locks nobody
// out, and re-running it simply supersedes the unfinished attempt.
router.post(
  "/mfa/setup",
  asyncHandler(async (req, res) => {
    const admin = await prisma.adminUser.findUnique({ where: { id: req.admin!.id } });
    if (!admin) throw ApiError.notFound("Admin not found");
    if (admin.mfaEnabledAt) {
      throw ApiError.badRequest("Two-factor authentication is already on for this account.");
    }

    const secret = generateMfaSecret();
    await prisma.adminUser.update({ where: { id: admin.id }, data: { mfaSecret: secret } });

    res.json({
      secret, // shown for manual entry when a QR code cannot be scanned
      otpauthUri: buildOtpAuthUri(admin.email, secret),
    });
  }),
);

// POST /api/v1/admin/account/mfa/enable — finish enrolment by proving a code.
router.post(
  "/mfa/enable",
  asyncHandler(async (req, res) => {
    const { code } = mfaCodeSchema.parse(req.body);

    const admin = await prisma.adminUser.findUnique({ where: { id: req.admin!.id } });
    if (!admin) throw ApiError.notFound("Admin not found");
    if (admin.mfaEnabledAt) {
      throw ApiError.badRequest("Two-factor authentication is already on for this account.");
    }
    if (!admin.mfaSecret) {
      throw ApiError.badRequest("Start setup again — no pending enrolment was found.");
    }
    if (!verifyTotp(code, admin.mfaSecret)) {
      throw ApiError.badRequest("That code is not right. Check your app and try the current one.", {
        code: "Incorrect code",
      });
    }

    // Returned exactly once. Only the hashes are stored, so these cannot be
    // shown again later — losing them means turning MFA off and re-enrolling.
    const recoveryCodes = generateRecoveryCodes();

    await prisma.adminUser.update({
      where: { id: admin.id },
      data: {
        mfaEnabledAt: new Date(),
        mfaRecoveryCodes: await hashRecoveryCodes(recoveryCodes),
      },
    });

    await recordAudit({ action: "auth.mfa_enabled", actor: admin.name, adminId: admin.id, req });

    res.json({ enabled: true, recoveryCodes });
  }),
);

// POST /api/v1/admin/account/mfa/disable
//
// Requires the account password *and* a current code: an attacker sitting on a
// stolen session should not be able to strip the second factor off the account.
router.post(
  "/mfa/disable",
  asyncHandler(async (req, res) => {
    const { password, code } = mfaDisableSchema.parse(req.body);

    const admin = await prisma.adminUser.findUnique({ where: { id: req.admin!.id } });
    if (!admin) throw ApiError.notFound("Admin not found");
    if (!admin.mfaEnabledAt || !admin.mfaSecret) {
      throw ApiError.badRequest("Two-factor authentication is not on for this account.");
    }

    if (!(await verifyPassword(password, admin.passwordHash))) {
      throw ApiError.badRequest("Password is incorrect", { password: "Incorrect password" });
    }
    if (!verifyTotp(code, admin.mfaSecret)) {
      throw ApiError.badRequest("That code is not right.", { code: "Incorrect code" });
    }

    await prisma.adminUser.update({
      where: { id: admin.id },
      data: { mfaEnabledAt: null, mfaSecret: null, mfaRecoveryCodes: [] },
    });

    // Lowering the account's protection ends every other session too.
    await revokeOtherSessions(admin.id, admin.email, res);

    await recordAudit({ action: "auth.mfa_disabled", actor: admin.name, adminId: admin.id, req });

    res.json({ enabled: false });
  }),
);

export default router;
