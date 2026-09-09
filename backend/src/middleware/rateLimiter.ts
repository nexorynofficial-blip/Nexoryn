import rateLimit from "express-rate-limit";
import { env } from "../config/env";
import { PrismaRateLimitStore } from "./rateLimitStore";

/** Applied globally as a coarse backstop — not the primary defense on any
 * one route, just a ceiling so no single client can hammer the whole API.
 *
 * Deliberately left on the in-memory store: it fires on every request, and
 * a database round-trip per request would cost more than this limiter is
 * worth. The limiters that actually protect something (login, contact) use
 * the persistent store below. */
export const globalRateLimiter = rateLimit({
  windowMs: 60_000,
  limit: 120,
  standardHeaders: true,
  legacyHeaders: false,
});

/** The contact form has zero spam protection today (client → EmailJS
 * directly) — this is a net-new requirement, not a regression to avoid. */
export const contactRateLimiter = rateLimit({
  windowMs: env.contactRateLimitWindowMs,
  limit: env.contactRateLimitMax,
  standardHeaders: true,
  legacyHeaders: false,
  store: new PrismaRateLimitStore("contact"),
  message: { error: "Too many submissions — please try again later." },
});

/** Brute-force defence on the admin login. Persisted, because an in-memory
 *  count that resets on every serverless cold start is not a defence. */
export const loginRateLimiter = rateLimit({
  windowMs: env.loginRateLimitWindowMs,
  limit: env.loginRateLimitMax,
  standardHeaders: true,
  legacyHeaders: false,
  store: new PrismaRateLimitStore("login"),
  message: { error: "Too many login attempts — please try again later." },
});

/** Brute-force defence on the action passkey (finance approve/reject, account
 *  password change). Keyed by admin id rather than IP: this only ever sits on
 *  routes behind authMiddleware, so req.admin is always populated by the time
 *  it runs, and the passkey is a per-account secret — the thing worth capping
 *  is attempts against one account, not one network address. */
export const passkeyRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 8,
  standardHeaders: true,
  legacyHeaders: false,
  store: new PrismaRateLimitStore("passkey"),
  keyGenerator: (req) => req.admin?.id ?? req.ip ?? "unknown",
  message: { error: "Too many passkey attempts — please wait and try again." },
});
