import { Router } from "express";
import { z } from "zod";
import { prisma } from "../../config/database";
import { authMiddleware } from "../../middleware/auth";
import { loginRateLimiter } from "../../middleware/rateLimiter";
import { recordAudit } from "../../services/audit";
import { consumeRecoveryCode, verifyTotp } from "../../services/mfa";
import { asyncHandler } from "../../utils/asyncHandler";
import { ApiError } from "../../utils/errors";
import {
  SESSION_COOKIE_NAME,
  sessionCookieOptions,
  signAdminToken,
  signMfaChallengeToken,
  verifyMfaChallengeToken,
} from "../../utils/jwt";
import { dummyPasswordCompare, verifyPassword } from "../../utils/password";

const router = Router();

const loginSchema = z.object({
  email: z.string().trim().email(),
  password: z.string().min(1),
});

const mfaSchema = z.object({
  mfaToken: z.string().min(1),
  code: z.string().trim().min(6).max(20),
});

/** Everything the admin panel needs about the signed-in account. Never
 *  includes the session token: the panel authenticates with the httpOnly
 *  cookie set alongside it, so returning the token in a readable body would
 *  only create a second copy for a browser extension or an XSS payload to
 *  find, buying nothing. */
const sessionView = (admin: {
  id: string;
  email: string;
  name: string;
  partnerName: string | null;
  role: string;
  mfaEnabledAt: Date | null;
}) => ({
  id: admin.id,
  email: admin.email,
  name: admin.name,
  partnerName: admin.partnerName,
  role: admin.role,
  mfaEnabled: admin.mfaEnabledAt !== null,
});

// POST /api/v1/admin/auth/login
router.post(
  "/login",
  loginRateLimiter,
  asyncHandler(async (req, res) => {
    const { email, password } = loginSchema.parse(req.body);

    const admin = await prisma.adminUser.findUnique({ where: { email } });

    // Hash a throwaway value when the account doesn't exist, so a missing
    // account costs the same ~200ms as a wrong password. Skipping the compare
    // makes "no such user" measurably faster to the millisecond, which is
    // enough to enumerate which addresses are real accounts.
    const valid = admin
      ? await verifyPassword(password, admin.passwordHash)
      : await dummyPasswordCompare(password);

    if (!admin || !valid) {
      await recordAudit({
        action: "auth.login_failed",
        actor: email,
        adminId: admin?.id ?? null,
        metadata: { reason: admin ? "bad_password" : "unknown_account" },
        req,
      });
      throw ApiError.unauthorized("Invalid credentials");
    }

    // Password is correct but a second factor is enrolled: hand back a
    // short-lived challenge token instead of a session. No cookie is set here.
    if (admin.mfaEnabledAt) {
      res.json({ mfaRequired: true, mfaToken: signMfaChallengeToken(admin.id) });
      return;
    }

    res.cookie(
      SESSION_COOKIE_NAME,
      signAdminToken({ id: admin.id, email: admin.email }),
      sessionCookieOptions,
    );
    await prisma.adminUser.update({
      where: { id: admin.id },
      data: { lastLoginAt: new Date() },
    });

    await recordAudit({ action: "auth.login", actor: admin.name, adminId: admin.id, req });
    res.json(sessionView(admin));
  }),
);

// POST /api/v1/admin/auth/login/mfa — completes a login that needs a second
// factor. Rate-limited on the same bucket as the password step, so the code
// can't be brute-forced once a password is known.
router.post(
  "/login/mfa",
  loginRateLimiter,
  asyncHandler(async (req, res) => {
    const { mfaToken, code } = mfaSchema.parse(req.body);

    let challenge;
    try {
      challenge = verifyMfaChallengeToken(mfaToken);
    } catch {
      throw ApiError.unauthorized("That took too long — please sign in again.");
    }

    const admin = await prisma.adminUser.findUnique({ where: { id: challenge.id } });
    if (!admin || !admin.mfaEnabledAt || !admin.mfaSecret) {
      throw ApiError.unauthorized("Invalid credentials");
    }

    let usedRecoveryCode = false;

    if (!verifyTotp(code, admin.mfaSecret)) {
      // Not a valid app code — it may still be one of the one-time recovery
      // codes, which is the way back in when the phone is gone.
      const remaining = await consumeRecoveryCode(code, admin.mfaRecoveryCodes);
      if (!remaining) {
        await recordAudit({
          action: "auth.login_failed",
          actor: admin.name,
          adminId: admin.id,
          metadata: { reason: "bad_mfa_code" },
          req,
        });
        throw ApiError.unauthorized("That code isn't right. Try the next one your app shows.");
      }
      await prisma.adminUser.update({
        where: { id: admin.id },
        data: { mfaRecoveryCodes: remaining },
      });
      usedRecoveryCode = true;
    }

    res.cookie(
      SESSION_COOKIE_NAME,
      signAdminToken({ id: admin.id, email: admin.email }),
      sessionCookieOptions,
    );
    await prisma.adminUser.update({
      where: { id: admin.id },
      data: { lastLoginAt: new Date() },
    });

    await recordAudit({
      action: "auth.login",
      actor: admin.name,
      adminId: admin.id,
      metadata: { secondFactor: usedRecoveryCode ? "recovery_code" : "totp" },
      req,
    });

    res.json({
      ...sessionView(admin),
      ...(usedRecoveryCode ? { recoveryCodesRemaining: admin.mfaRecoveryCodes.length - 1 } : {}),
    });
  }),
);

// POST /api/v1/admin/auth/logout
//
// Requires a session, because logging out has to do more than clear a cookie:
// it pushes sessionsValidFrom forward, which is what actually invalidates the
// token. Without that, a token copied out of the browser stays usable for its
// full lifetime after the user believes they signed out.
router.post(
  "/logout",
  authMiddleware,
  asyncHandler(async (req, res) => {
    await prisma.adminUser.update({
      where: { id: req.admin!.id },
      data: { sessionsValidFrom: new Date() },
    });
    await recordAudit({
      action: "auth.logout",
      actor: req.admin!.name,
      adminId: req.admin!.id,
      req,
    });
    res.clearCookie(SESSION_COOKIE_NAME, { path: sessionCookieOptions.path });
    res.status(204).send();
  }),
);

// GET /api/v1/admin/auth/me
router.get(
  "/me",
  authMiddleware,
  asyncHandler(async (req, res) => {
    const admin = await prisma.adminUser.findUnique({ where: { id: req.admin!.id } });
    if (!admin) throw ApiError.unauthorized("Admin not found");
    res.json(sessionView(admin));
  }),
);

export default router;
