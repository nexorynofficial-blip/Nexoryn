// Pinned below 4.0.0 deliberately: web-push@4 ships as a real ESM-only
// package ("type": "module"), which a CommonJS backend can't require() on
// Vercel's actual Node runtime (ERR_REQUIRE_ESM) even though tsc's
// esModuleInterop compiles the import without complaint and it even runs
// under Bun locally — both are misleading signals. 3.6.x is genuine
// CommonJS (module.exports = {...}), so the default import below is real,
// not an interop shim.
import webpush from "web-push";
import { prisma } from "../config/database";
import { env } from "../config/env";

let configured = false;
function ensureConfigured() {
  if (configured || !env.vapidPublicKey || !env.vapidPrivateKey) return;
  webpush.setVapidDetails(env.vapidSubject, env.vapidPublicKey, env.vapidPrivateKey);
  configured = true;
}

export function pushEnabled(): boolean {
  return Boolean(env.vapidPublicKey && env.vapidPrivateKey);
}

export interface PushPayload {
  title: string;
  body: string;
  linkUrl?: string | null;
  /** Lets the browser replace an older, still-unseen notification of the
   *  same kind instead of stacking a pile of them — see sw.js's push
   *  handler, which passes this straight through as Notification `tag`. */
  tag?: string;
}

/**
 * Sends one push message to one subscription. Never throws: a dead
 * subscription (404/410 — the push service says this endpoint will never
 * accept another message) is deleted so nothing keeps retrying it forever;
 * any other failure (network blip, the push service being down) is logged
 * and left alone, since that one might succeed next time.
 *
 * Takes the raw Prisma row rather than re-fetching, since the caller
 * (notify.ts) already has a batch of these loaded.
 */
export async function sendPush(
  subscription: { id: string; endpoint: string; p256dh: string; auth: string },
  payload: PushPayload,
): Promise<void> {
  ensureConfigured();
  if (!pushEnabled()) return;

  try {
    await webpush.sendNotification(
      {
        endpoint: subscription.endpoint,
        keys: { p256dh: subscription.p256dh, auth: subscription.auth },
      },
      JSON.stringify(payload),
    );
    await prisma.pushSubscription
      .update({ where: { id: subscription.id }, data: { lastSeenAt: new Date() } })
      .catch(() => {});
  } catch (error) {
    const statusCode = (error as { statusCode?: number } | undefined)?.statusCode;
    if (statusCode === 404 || statusCode === 410) {
      await prisma.pushSubscription.delete({ where: { id: subscription.id } }).catch(() => {
        // Already gone (e.g. the admin removed it from Account settings in
        // the same moment) — fine, that's the end state either way wanted.
      });
      return;
    }
    console.error(`Push send failed for subscription ${subscription.id} (status ${statusCode ?? "?"}):`, error);
  }
}
