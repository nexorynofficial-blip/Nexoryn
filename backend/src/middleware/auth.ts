import type { NextFunction, Request, Response } from "express";
import { prisma } from "../config/database";
import { ApiError } from "../utils/errors";
import { asyncHandler } from "../utils/asyncHandler";
import { SESSION_COOKIE_NAME, verifyAdminToken } from "../utils/jwt";

/** Requires a valid admin session (httpOnly cookie, or a Bearer token as a
 * fallback for non-browser API clients / the admin panel's own token storage
 * if it chooses that route). Populates `req.admin` on success.
 *
 * The account is re-read from the database on every request rather than
 * trusted from the token's claims. That is what makes two things possible
 * that a purely stateless JWT cannot do: revoking a session before its
 * expiry (sessionsValidFrom, below), and having a role change take effect
 * immediately instead of whenever the holder's token happens to lapse. */
export const authMiddleware = asyncHandler(
  async (req: Request, _res: Response, next: NextFunction) => {
    const bearer = req.headers.authorization?.startsWith("Bearer ")
      ? req.headers.authorization.slice("Bearer ".length)
      : undefined;
    const token = req.cookies?.[SESSION_COOKIE_NAME] ?? bearer;

    if (!token) {
      throw ApiError.unauthorized();
    }

    let payload;
    try {
      payload = verifyAdminToken(token);
    } catch {
      throw ApiError.unauthorized("Invalid or expired session");
    }

    const admin = await prisma.adminUser.findUnique({ where: { id: payload.id } });
    if (!admin) {
      throw ApiError.unauthorized("Invalid or expired session");
    }

    // Session revocation. `iat` is in whole seconds, so compare on the same
    // scale — a token minted in the same second as the revocation is treated
    // as issued before it, which errs toward logging someone out rather than
    // leaving a session alive that was meant to be killed.
    const issuedAt = payload.iat;
    const validFrom = Math.floor(admin.sessionsValidFrom.getTime() / 1000);
    if (issuedAt < validFrom) {
      throw ApiError.unauthorized("Session has been signed out. Please log in again.");
    }

    req.admin = {
      id: admin.id,
      email: admin.email,
      name: admin.name,
      role: admin.role,
      partnerName: admin.partnerName,
    };
    next();
  },
);

/**
 * Restricts a route to specific roles. Must be registered *after*
 * authMiddleware, which is what puts `req.admin` in place.
 *
 * "owner" covers the partners: the finance ledger, the admin directory, and
 * the contact export (which is customer PII). "admin" is content-only —
 * projects, services, reviews, team, FAQs and assets. Before this existed,
 * every authenticated account had all of it.
 */
export function requireRole(...roles: string[]) {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (!req.admin) return next(ApiError.unauthorized());
    if (!roles.includes(req.admin.role)) {
      return next(ApiError.forbidden("Your account does not have access to this area"));
    }
    next();
  };
}
