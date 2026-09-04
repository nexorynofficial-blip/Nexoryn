import { Router } from "express";
import { z } from "zod";
import { prisma } from "../../config/database";
import { authMiddleware } from "../../middleware/auth";
import { loginRateLimiter } from "../../middleware/rateLimiter";
import { asyncHandler } from "../../utils/asyncHandler";
import { ApiError } from "../../utils/errors";
import { SESSION_COOKIE_NAME, sessionCookieOptions, signAdminToken } from "../../utils/jwt";
import { verifyPassword } from "../../utils/password";

const router = Router();

const loginSchema = z.object({
  email: z.string().trim().email(),
  password: z.string().min(1),
});

// POST /api/v1/admin/auth/login
router.post(
  "/login",
  loginRateLimiter,
  asyncHandler(async (req, res) => {
    const { email, password } = loginSchema.parse(req.body);

    const admin = await prisma.adminUser.findUnique({ where: { email } });
    const valid = admin ? await verifyPassword(password, admin.passwordHash) : false;

    if (!admin || !valid) {
      throw ApiError.unauthorized("Invalid credentials");
    }

    const token = signAdminToken({ id: admin.id, email: admin.email });

    // httpOnly cookie is the primary mechanism (see docs/TRD.md §7 — keeps
    // this out of localStorage/sessionStorage, both for XSS safety and to
    // stay consistent with the public site's "no browser storage" claim,
    // since this is a plain server-set cookie scoped to /api/v1/admin, not
    // client-side visitor tracking). The token is also returned in the body
    // for an admin SPA that prefers Authorization-header auth instead.
    res.cookie(SESSION_COOKIE_NAME, token, sessionCookieOptions);

    await prisma.adminUser.update({ where: { id: admin.id }, data: { lastLoginAt: new Date() } });

    res.json({ email: admin.email, name: admin.name, partnerName: admin.partnerName, token });
  }),
);

// POST /api/v1/admin/auth/logout
router.post("/logout", (_req, res) => {
  res.clearCookie(SESSION_COOKIE_NAME, { path: sessionCookieOptions.path });
  res.status(204).send();
});

// GET /api/v1/admin/auth/me
router.get(
  "/me",
  authMiddleware,
  asyncHandler(async (req, res) => {
    const admin = await prisma.adminUser.findUnique({ where: { id: req.admin!.id } });
    if (!admin) throw ApiError.unauthorized("Admin not found");
    res.json({
      id: admin.id,
      email: admin.email,
      name: admin.name,
      // Ledger identity — the admin UI needs it to know which partner card is
      // theirs and which approval requests are theirs to decide.
      partnerName: admin.partnerName,
      role: admin.role,
    });
  }),
);

export default router;
