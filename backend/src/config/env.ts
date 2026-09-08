import { config } from "dotenv";

config();

function required(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

function optional(name: string, fallback: string): string {
  return process.env[name] ?? fallback;
}

export const env = {
  nodeEnv: optional("NODE_ENV", "development"),
  port: Number(optional("PORT", "3001")),

  frontendUrl: optional("FRONTEND_URL", "http://localhost:5173"),
  frontendProdUrl: optional("FRONTEND_PROD_URL", ""),
  adminUrl: optional("ADMIN_URL", "http://localhost:5174"),
  adminProdUrl: optional("ADMIN_PROD_URL", ""),

  databaseUrl: required("DATABASE_URL"),

  jwtSecret: required("JWT_SECRET"),
  // 12h, not the 7d this used to be. A stolen session cookie is usable until
  // it expires, so the window matters; 12h keeps a normal working day to one
  // login while cutting the worst case from a week to half a day. Signing out
  // or changing your password revokes outstanding tokens immediately either
  // way — see AdminUser.sessionsValidFrom.
  jwtExpiresIn: optional("JWT_EXPIRES_IN", "12h"),

  resendApiKey: process.env.RESEND_API_KEY ?? "",
  resendFromAddress: optional("RESEND_FROM_ADDRESS", "Nexoryn <noreply@nexoryn.ai>"),
  adminNotificationEmail: optional("ADMIN_NOTIFICATION_EMAIL", "nexorynofficial@gmail.com"),

  cloudinaryCloudName: process.env.CLOUDINARY_CLOUD_NAME ?? "",
  cloudinaryApiKey: process.env.CLOUDINARY_API_KEY ?? "",
  cloudinaryApiSecret: process.env.CLOUDINARY_API_SECRET ?? "",

  contactRateLimitWindowMs: Number(optional("CONTACT_RATE_LIMIT_WINDOW_MS", "600000")),
  contactRateLimitMax: Number(optional("CONTACT_RATE_LIMIT_MAX", "5")),
  loginRateLimitWindowMs: Number(optional("LOGIN_RATE_LIMIT_WINDOW_MS", "900000")),
  loginRateLimitMax: Number(optional("LOGIN_RATE_LIMIT_MAX", "10")),

  isProduction: optional("NODE_ENV", "development") === "production",
};

/** Origins allowed to call this API — used by the CORS middleware and by the
 *  CSRF origin check (src/middleware/csrf.ts).
 *
 *  FRONTEND_URL and ADMIN_URL keep their localhost defaults for developer
 *  convenience, which would otherwise leave `http://localhost:5173` trusted by
 *  the *production* API: anything running on a developer's or a victim's own
 *  machine could then drive the live admin API with a real session cookie.
 *  In production, local origins are dropped. */
export function allowedOrigins(): string[] {
  const origins = [env.frontendUrl, env.frontendProdUrl, env.adminUrl, env.adminProdUrl].filter(
    Boolean,
  );

  if (!env.isProduction) return origins;

  return origins.filter((origin) => {
    try {
      const { hostname } = new URL(origin);
      return hostname !== "localhost" && hostname !== "127.0.0.1" && hostname !== "[::1]";
    } catch {
      return false; // A malformed origin can never be matched safely.
    }
  });
}
