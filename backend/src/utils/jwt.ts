import jwt from "jsonwebtoken";
import { env } from "../config/env";

export interface AdminTokenPayload {
  id: string;
  email: string;
}

export function signAdminToken(payload: AdminTokenPayload): string {
  return jwt.sign(payload, env.jwtSecret, { expiresIn: env.jwtExpiresIn as jwt.SignOptions["expiresIn"] });
}

export function verifyAdminToken(token: string): AdminTokenPayload {
  return jwt.verify(token, env.jwtSecret) as AdminTokenPayload;
}

export const SESSION_COOKIE_NAME = "nexoryn_admin_session";

/** Shared cookie options for setting/clearing the admin session cookie.
 *
 * sameSite must be "none" in production: the admin panel and API are
 * deployed as two separate Vercel projects on different domains
 * (nexoryn-delta.vercel.app vs. nexoryn-*.vercel.app), which makes every
 * request genuinely cross-site. "strict" (or "lax") tells the browser to
 * never send the cookie on a cross-site request at all — login would
 * succeed and set the cookie, but every following request would look
 * logged-out. "none" requires secure:true, which is already true in
 * production (both sides are HTTPS). Locally, frontend and backend share
 * the "localhost" registrable domain regardless of port, so "lax" is both
 * sufficient and safer than "none" (which requires HTTPS to work at all,
 * and localhost dev is plain HTTP). */
export const sessionCookieOptions = {
  httpOnly: true,
  secure: env.isProduction,
  sameSite: env.isProduction ? ("none" as const) : ("lax" as const),
  path: "/api/v1/admin",
};
