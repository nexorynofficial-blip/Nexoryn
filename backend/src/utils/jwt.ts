import jwt from "jsonwebtoken";
import { env } from "../config/env";

export interface AdminTokenPayload {
  id: string;
  email: string;
  /** Issued-at, in seconds. Compared against AdminUser.sessionsValidFrom to
   *  reject tokens minted before the account's last revocation event. */
  iat: number;
}

/** Pinned so a token can only ever be verified with the algorithm we sign
 *  with. Without this, verification accepts anything in the same family that
 *  jsonwebtoken deems compatible with the key — narrowing it to one algorithm
 *  removes that class of confusion entirely. */
const ALGORITHM = "HS256" as const;
const ISSUER = "nexoryn-api";
const AUDIENCE = "nexoryn-admin";

export function signAdminToken(payload: { id: string; email: string }): string {
  return jwt.sign({ id: payload.id, email: payload.email }, env.jwtSecret, {
    algorithm: ALGORITHM,
    issuer: ISSUER,
    audience: AUDIENCE,
    expiresIn: env.jwtExpiresIn as jwt.SignOptions["expiresIn"],
  });
}

export function verifyAdminToken(token: string): AdminTokenPayload {
  return jwt.verify(token, env.jwtSecret, {
    algorithms: [ALGORITHM],
    issuer: ISSUER,
    audience: AUDIENCE,
  }) as AdminTokenPayload;
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
 * and localhost dev is plain HTTP).
 *
 * Because "none" means the browser attaches this cookie to cross-site
 * requests, it is `requireTrustedOrigin` (src/middleware/csrf.ts) — not the
 * cookie's own SameSite setting — that stops another site from driving the
 * API with it. The two go together; don't remove one without the other. */
export const sessionCookieOptions = {
  httpOnly: true,
  secure: env.isProduction,
  sameSite: env.isProduction ? ("none" as const) : ("lax" as const),
  path: "/api/v1/admin",
};
