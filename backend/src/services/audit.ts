import type { Request } from "express";
import { prisma } from "../config/database";

export type AuditAction =
  | "auth.login"
  | "auth.login_failed"
  | "auth.login_blocked"
  | "auth.logout"
  | "account.password_changed"
  | "account.profile_updated"
  | "account.passkey_generated"
  | "account.passkey_regenerated"
  | "security.passkey_failed"
  | "finance.created"
  | "finance.approved"
  | "finance.rejected"
  | "finance.deleted"
  | "finance.change_requested"
  | "finance.change_approved"
  | "finance.change_rejected"
  | "contact.exported"
  | "asset.deleted";

interface AuditInput {
  action: AuditAction;
  /** Free-text label for who acted — an admin's name, or the email that was
   *  tried on a failed login. Kept even when adminId is null. */
  actor: string;
  adminId?: string | null;
  target?: string | null;
  metadata?: Record<string, unknown> | null;
  req?: Request;
}

/** The caller's IP, as Express resolves it. Meaningful only because
 *  `trust proxy` is set in app.ts — without that this would be Vercel's
 *  address on every single request. */
function clientIp(req?: Request): string | null {
  if (!req) return null;
  return req.ip ?? null;
}

/**
 * Writes one row to the append-only audit trail.
 *
 * Never throws: an audit write failing must not turn a successful action into
 * an error the user sees, or — worse — roll back money that actually moved.
 * A failure here is logged to the platform log instead, which is the one place
 * that survives the database being the thing that broke.
 */
export async function recordAudit(input: AuditInput): Promise<void> {
  try {
    await prisma.auditLog.create({
      data: {
        action: input.action,
        actor: input.actor,
        adminId: input.adminId ?? null,
        target: input.target ?? null,
        ip: clientIp(input.req),
        metadata: (input.metadata ?? undefined) as never,
      },
    });
  } catch (error) {
    console.error(`Audit write failed for ${input.action}:`, error);
  }
}
