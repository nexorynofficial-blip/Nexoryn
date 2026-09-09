import crypto from "node:crypto";
import bcrypt from "bcryptjs";
import { buildOtpAuthUri, generateTotpSecret, verifyTotp as verifyTotpCode } from "./totp";

const RECOVERY_CODE_COUNT = 10;

export function generateMfaSecret(): string {
  return generateTotpSecret();
}

export { buildOtpAuthUri };

export function verifyTotp(code: string, secret: string): boolean {
  return verifyTotpCode(code, secret);
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
