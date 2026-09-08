import type { NextFunction, Request, Response } from "express";
import { allowedOrigins } from "../config/env";
import { ApiError } from "../utils/errors";
import { SESSION_COOKIE_NAME } from "../utils/jwt";

const STATE_CHANGING = new Set(["POST", "PUT", "PATCH", "DELETE"]);

/**
 * Cross-site request forgery defence.
 *
 * The session cookie is `SameSite=None` in production because the admin panel
 * and this API live on different Vercel domains, so the browser genuinely has
 * to send it cross-site. The cost of that is the browser will *also* send it
 * on a request some other site triggered — a hidden form POST, say, which is
 * a "simple request" and so never gets held back by a CORS preflight. CORS
 * stops the attacker reading the response; it does nothing to stop the write.
 *
 * So we check where the request came from. Browsers set `Origin` on every
 * cross-origin request and on same-origin POSTs, and it cannot be forged by
 * page JavaScript — an attacker's page always announces its own origin.
 *
 * Only requests that actually carry the session cookie are checked. A request
 * without it can't do anything privileged in the first place, and demanding an
 * Origin header from every caller would break non-browser clients (curl, a
 * cron job) that authenticate with a Bearer token instead — those aren't
 * reachable by CSRF, because there is no ambient credential for a browser to
 * attach on an attacker's behalf.
 */
export function requireTrustedOrigin(req: Request, _res: Response, next: NextFunction) {
  if (!STATE_CHANGING.has(req.method)) return next();

  const hasSessionCookie = Boolean(req.cookies?.[SESSION_COOKIE_NAME]);
  if (!hasSessionCookie) return next();

  const allowed = allowedOrigins();
  const origin = req.headers.origin;

  if (origin) {
    if (allowed.includes(origin)) return next();
    return next(ApiError.forbidden("Request origin is not allowed"));
  }

  // No Origin header. Fall back to Referer, which older browsers still send,
  // and which is equally unforgeable from page JavaScript.
  const referer = req.headers.referer;
  if (referer) {
    try {
      if (allowed.includes(new URL(referer).origin)) return next();
    } catch {
      // Malformed Referer — treat exactly like a missing one.
    }
  }

  // A cookie-bearing state change that won't say where it came from is not
  // something any browser we support produces. Refuse rather than guess.
  return next(ApiError.forbidden("Could not verify request origin"));
}
