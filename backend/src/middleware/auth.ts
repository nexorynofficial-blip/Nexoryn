import type { NextFunction, Request, Response } from "express";
import { ApiError } from "../utils/errors";
import { SESSION_COOKIE_NAME, verifyAdminToken } from "../utils/jwt";

/** Requires a valid admin session (httpOnly cookie, or a Bearer token as a
 * fallback for non-browser API clients / the admin panel's own token storage
 * if it chooses that route). Populates `req.admin` on success. */
export function authMiddleware(req: Request, _res: Response, next: NextFunction) {
  const bearer = req.headers.authorization?.startsWith("Bearer ")
    ? req.headers.authorization.slice("Bearer ".length)
    : undefined;
  const token = req.cookies?.[SESSION_COOKIE_NAME] ?? bearer;

  if (!token) {
    return next(ApiError.unauthorized());
  }

  try {
    req.admin = verifyAdminToken(token);
    next();
  } catch {
    next(ApiError.unauthorized("Invalid or expired session"));
  }
}
