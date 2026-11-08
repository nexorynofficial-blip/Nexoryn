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
 * In production the browser never talks to the backend's own domain
 * directly — the admin app (nexoryn.tech/cfokp) calls same-origin paths
 * under /cfokp/api/*, which the root vercel.json rewrites (proxies)
 * server-side to the real backend. From the browser's point of view this
 * cookie is first-party, so "lax" works and is safer than "none": iOS
 * Safari (and specifically standalone Home-Screen web apps, which apply
 * cross-site cookie restrictions even more aggressively than a normal
 * Safari tab) was silently dropping a genuinely cross-site "none" cookie,
 * which made login appear to succeed while every following request looked
 * logged-out. Locally there's no proxy — the admin app calls
 * http://localhost:3001 directly — but that's still same-site (shared
 * "localhost" registrable domain), so "lax" has always been correct there
 * too.
 *
 * The cookie's Path must match the URL the *browser* sees, not the path
 * the backend receives after Vercel strips the /cfokp/api prefix — a
 * narrower Path here would mean the cookie never gets reattached to the
 * admin app's own requests. */
export const sessionCookieOptions = {
  httpOnly: true,
  secure: env.isProduction,
  sameSite: "lax" as const,
  path: env.isProduction ? "/cfokp/api/v1/admin" : "/api/v1/admin",
};
