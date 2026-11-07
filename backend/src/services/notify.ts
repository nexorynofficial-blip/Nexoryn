import { waitUntil } from "@vercel/functions";
import { prisma } from "../config/database";
import { sendPush } from "./push";

/**
 * Every event that can notify. Free text in the database (Notification.
 * eventType), typed here so a call site can't typo one — add a new one here
 * first, then call notify() with it.
 */
export type NotifyEventType =
  | "contact.submitted"
  | "finance.created"
  | "finance.approved"
  | "finance.rejected"
  | "finance.change_requested"
  | "finance.change_approved"
  | "finance.change_rejected"
  | "project.created"
  | "project.updated"
  | "internal_project.created"
  | "internal_project.updated"
  | "review.created"
  | "review.updated"
  | "service.created"
  | "service.updated"
  | "team_member.created"
  | "team_member.updated"
  | "faq.created"
  | "faq.updated";

export interface NotifyInput {
  eventType: NotifyEventType;
  title: string;
  body: string;
  /** Path the notification should open, e.g. "/finance" — relative to the
   *  admin app's own base (/cfokp), not an absolute URL. */
  linkUrl?: string;
  /** Whoever caused the event. Every *other* admin gets notified; this
   *  person doesn't get told about their own action. Pass null only for an
   *  event with no admin actor at all (the public contact form). */
  actingAdminId: string | null;
}

// A rapid double-save of the same thing (fix a typo, save again) shouldn't
// double every other admin's feed. Same event type + same actor + same title
// within this window collapses to one notification.
const DEDUPE_WINDOW_MS = 30_000;

/**
 * Writes a Notification row for every admin except the one who caused the
 * event, then sends each of them a push (best-effort, backgrounded — see
 * below). Never throws: exactly like recordAudit(), a notification failing
 * must never turn a successful save into an error response, or undo
 * anything that already happened.
 *
 * The two halves run on different guarantees on purpose:
 *  - the Notification rows are written and *awaited* before this returns,
 *    so the in-app bell/feed is always accurate the instant the caller's
 *    own request finishes, regardless of whether push works at all.
 *  - the actual push send is handed to waitUntil() instead of awaited: this
 *    backend runs as a Vercel serverless function, which can freeze right
 *    after the response is sent, so a push call still in flight at that
 *    point without waitUntil() could simply never complete. waitUntil()
 *    keeps the invocation alive long enough to finish it, without making
 *    the admin who triggered this wait on 2 outbound network calls before
 *    their own save response comes back.
 */
export async function notify(input: NotifyInput): Promise<void> {
  try {
    const recipients = await prisma.adminUser.findMany({
      where: input.actingAdminId ? { id: { not: input.actingAdminId } } : {},
      select: { id: true },
    });
    if (recipients.length === 0) return;

    const actor = input.actingAdminId
      ? await prisma.adminUser.findUnique({ where: { id: input.actingAdminId }, select: { name: true } })
      : null;

    const since = new Date(Date.now() - DEDUPE_WINDOW_MS);
    const recent = await prisma.notification.findFirst({
      where: {
        eventType: input.eventType,
        actorAdminId: input.actingAdminId,
        title: input.title,
        createdAt: { gte: since },
      },
      select: { id: true },
    });
    if (recent) return;

    await prisma.notification.createMany({
      data: recipients.map((r) => ({
        adminId: r.id,
        eventType: input.eventType,
        title: input.title,
        body: input.body,
        linkUrl: input.linkUrl ?? null,
        actorAdminId: input.actingAdminId,
        actorName: actor?.name ?? null,
      })),
    });

    waitUntil(pushToRecipients(recipients.map((r) => r.id), input));
  } catch (error) {
    console.error(`notify() failed for ${input.eventType}:`, error);
  }
}

async function pushToRecipients(adminIds: string[], input: NotifyInput): Promise<void> {
  const subscriptions = await prisma.pushSubscription.findMany({ where: { adminId: { in: adminIds } } });
  await Promise.allSettled(
    subscriptions.map((sub) =>
      sendPush(sub, { title: input.title, body: input.body, linkUrl: input.linkUrl, tag: input.eventType }),
    ),
  );
}
