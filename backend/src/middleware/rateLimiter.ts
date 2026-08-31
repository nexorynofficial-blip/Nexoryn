import rateLimit from "express-rate-limit";
import { env } from "../config/env";

/** Applied globally as a coarse backstop — not the primary defense on any
 * one route, just a ceiling so no single client can hammer the whole API. */
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
  message: { error: "Too many submissions — please try again later." },
});

export const loginRateLimiter = rateLimit({
  windowMs: env.loginRateLimitWindowMs,
  limit: env.loginRateLimitMax,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many login attempts — please try again later." },
});
