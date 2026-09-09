import crypto from "node:crypto";
import type { Request } from "express";
import bcrypt from "bcryptjs";
import { prisma } from "../config/database";
import { ApiError } from "../utils/errors";
import { recordAudit } from "./audit";

/**
 * The action passkey — a second secret, separate from the login password,
 * required to approve or reject a finance request and to change the account
 * password. Unlike the TOTP two-factor this replaces, it isn't time-based and
 * doesn't need an authenticator app: it's generated once from Account
 * Settings, shown exactly one time, and only its bcrypt hash is ever stored.
 * From then on, every gated action asks for it again.
 */

// 32 symbols, RFC 4648-style but with the visually ambiguous ones (0/O, 1/I/L)
// removed — this is typed by a human, sometimes off a phone screen, so every
// character has to be unambiguous at a glance.
const ALPHABET = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";
const PASSKEY_LENGTH = 12; // 12 chars from a 32-symbol alphabet = 60 bits of entropy
const BCRYPT_COST = 10; // high-entropy secret; verified on every gated action, so cheaper than the login password's cost 12

/** Strips formatting so "abcd-efgh-jkmn", "ABCD EFGH JKMN" and the bare
 *  32-character string all compare equal — the user only has to get the
 *  characters right, not the punctuation. */
function normalize(passkey: string): string {
  return passkey.trim().toUpperCase().replace(/[\s-]/g, "");
}

/** A fresh passkey, formatted in dash-separated groups of four for
 *  readability (e.g. "K7XQ-2MRT-9FHD-B3WY"). Each character comes from one
 *  random byte mod 32 — unbiased, since 256 divides evenly by 32. */
export function generatePasskey(): string {
  const bytes = crypto.randomBytes(PASSKEY_LENGTH);
  const chars = Array.from(bytes, (b) => ALPHABET[b % ALPHABET.length]);
  return (chars.join("").match(/.{1,4}/g) ?? []).join("-");
}

export function hashPasskey(passkey: string): Promise<string> {
  return bcrypt.hash(normalize(passkey), BCRYPT_COST);
}

/**
 * Verifies a passkey for a gated action, throwing a clear ApiError on
 * failure so callers don't need their own branching:
 *  - no passkey set up yet → 400, telling them where to set one up
 *  - wrong passkey → 403, and the attempt is audited
 *  - correct → resolves, nothing else to do
 */
export async function verifyActionPasskey(
  admin: { id: string; name: string },
  passkey: string,
  req: Request,
): Promise<void> {
  const record = await prisma.adminUser.findUnique({
    where: { id: admin.id },
    select: { actionPasskeyHash: true },
  });

  if (!record?.actionPasskeyHash) {
    throw ApiError.badRequest(
      "Set up a passkey in Account Settings before doing this.",
      { passkey: "No passkey set up yet" },
    );
  }

  const valid = await bcrypt.compare(normalize(passkey), record.actionPasskeyHash);
  if (!valid) {
    await recordAudit({
      action: "security.passkey_failed",
      actor: admin.name,
      adminId: admin.id,
      req,
    });
    throw new ApiError(403, "Incorrect passkey.", { passkey: "Incorrect passkey" });
  }
}
