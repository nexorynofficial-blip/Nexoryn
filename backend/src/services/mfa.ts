import crypto from "node:crypto";
import bcrypt from "bcryptjs";
import { generateSecret, generateURI, verifySync } from "otplib";

const ISSUER = "Nexoryn Admin";
const RECOVERY_CODE_COUNT = 10;

/** Accept a code from the adjacent 30-second step in either direction, so one
 *  typed as it rolls over — or from a phone whose clock is slightly off —
 *  still works. Wider than this starts meaningfully extending how long a
 *  phished code stays usable. */
const EPOCH_TOLERANCE_SECONDS = 30;

export function generateMfaSecret(): string {
  return generateSecret();
}

/** The otpauth:// URI an authenticator app scans. Contains the shared secret,
 *  so it is only ever returned to the account being enrolled, over HTTPS, and
 *  never logged. */
export function buildOtpAuthUri(email: string, secret: string): string {
  return generateURI({ issuer: ISSUER, label: email, secret });
}

export function verifyTotp(code: string, secret: string): boolean {
  try {
    return verifySync({
      secret,
      token: code.replace(/\s/g, ""),
      epochTolerance: EPOCH_TOLERANCE_SECONDS,
    }).valid;
  } catch {
    // A malformed secret or token throws rather than returning false; either
    // way the answer the caller needs is "no".
    return false;
  }
}

/** Ten single-use codes, shown exactly once at enrolment. Only their bcrypt
 *  hashes are stored, so a database leak doesn't hand over a way past MFA. */
export function generateRecoveryCodes(): string[] {
  return Array.from({ length: RECOVERY_CODE_COUNT }, () => {
    const raw = crypto.randomBytes(5).toString("hex").toUpperCase(); // 10 hex chars
    return `${raw.slice(0, 5)}-${raw.slice(5)}`;
  });
}

export function hashRecoveryCodes(codes: string[]): Promise<string[]> {
  // Cost 10 rather than the 12 used for passwords: these are 40 bits of pure
  // randomness with no reuse across sites, so the slow-hash cost is buying far
  // less here, and enrolment hashes ten of them in one request.
  return Promise.all(codes.map((code) => bcrypt.hash(code, 10)));
}

/**
 * Checks a recovery code against the stored hashes. Returns the remaining
 * hashes with the used one removed, or null when nothing matched — the caller
 * persists that list, which is what makes each code single-use.
 */
export async function consumeRecoveryCode(
  code: string,
  hashes: string[],
): Promise<string[] | null> {
  const normalized = code.trim().toUpperCase();
  for (const hash of hashes) {
    if (await bcrypt.compare(normalized, hash)) {
      return hashes.filter((h) => h !== hash);
    }
  }
  return null;
}
