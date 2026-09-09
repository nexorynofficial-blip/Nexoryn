import crypto from "node:crypto";

/**
 * TOTP (RFC 6238) and its underlying HOTP (RFC 4226), implemented directly
 * against `node:crypto` instead of a library.
 *
 * This replaces `otplib`, which pulled in `@scure/base` — a pure-ESM package
 * with no CommonJS build. This backend compiles to CommonJS (see
 * backend/package.json's `"type": "commonjs"` and the Vercel serverless
 * runtime it deploys to), and `require()`-ing an ESM-only module throws
 * `ERR_REQUIRE_ESM` at runtime — which surfaced only once deployed, since
 * `tsc --noEmit` type-checks against otplib's `.d.ts` files without ever
 * loading the real module graph. TOTP is genuinely small (a handful of RFC
 * primitives), so owning it outright removes an entire class of packaging
 * failure instead of trading one dependency's build quirks for another's.
 */

const RFC4648_ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";

/** Encodes bytes as unpadded Base32 (RFC 4648 §6) — the format every
 *  authenticator app expects a TOTP secret in. */
export function base32Encode(buffer: Buffer): string {
  let bits = "";
  for (const byte of buffer) bits += byte.toString(2).padStart(8, "0");

  let output = "";
  for (let i = 0; i < bits.length; i += 5) {
    const chunk = bits.slice(i, i + 5).padEnd(5, "0");
    output += RFC4648_ALPHABET[parseInt(chunk, 2)];
  }
  return output;
}

/** Decodes Base32 back to bytes. Accepts lowercase, stray whitespace, and
 *  `=` padding — the shapes a human might paste in even though nothing here
 *  generates padded output itself. */
export function base32Decode(input: string): Buffer {
  const clean = input.toUpperCase().replace(/[^A-Z2-7]/g, "");

  let bits = "";
  for (const char of clean) {
    const value = RFC4648_ALPHABET.indexOf(char);
    if (value === -1) continue;
    bits += value.toString(2).padStart(5, "0");
  }

  const bytes: number[] = [];
  for (let i = 0; i + 8 <= bits.length; i += 8) {
    bytes.push(parseInt(bits.slice(i, i + 8), 2));
  }
  return Buffer.from(bytes);
}

/** HOTP (RFC 4226) — an HMAC-SHA1-based one-time code for a given counter.
 *  TOTP is just this with the counter derived from the clock. */
function hotp(secret: Buffer, counter: number, digits = 6): string {
  const counterBuffer = Buffer.alloc(8);
  // Counter is a 64-bit big-endian integer; JS numbers are safe up to 2^53,
  // which covers every counter value this application will ever reach.
  counterBuffer.writeUInt32BE(Math.floor(counter / 2 ** 32), 0);
  counterBuffer.writeUInt32BE(counter % 2 ** 32, 4);

  const hmac = crypto.createHmac("sha1", secret).update(counterBuffer).digest();

  // Dynamic truncation (RFC 4226 §5.4): the low nibble of the last byte picks
  // a 4-byte offset into the HMAC, whose top bit is then masked off to avoid
  // sign ambiguity, then reduced mod 10^digits.
  const offset = hmac[hmac.length - 1] & 0x0f;
  const binary =
    ((hmac[offset] & 0x7f) << 24) |
    ((hmac[offset + 1] & 0xff) << 16) |
    ((hmac[offset + 2] & 0xff) << 8) |
    (hmac[offset + 3] & 0xff);

  return String(binary % 10 ** digits).padStart(digits, "0");
}

const PERIOD_SECONDS = 30;
const DIGITS = 6;

function currentTimeStep(): number {
  return Math.floor(Date.now() / 1000 / PERIOD_SECONDS);
}

export function generateTotp(base32Secret: string, timeStep = currentTimeStep()): string {
  return hotp(base32Decode(base32Secret), timeStep, DIGITS);
}

/** Verifies a 6-digit code against the current time step and one step either
 *  side (±30s), so a code typed as it rolls over, or from a phone whose clock
 *  has drifted slightly, still works. Wider than this starts meaningfully
 *  extending how long a phished code stays usable. */
export function verifyTotp(code: string, base32Secret: string): boolean {
  const normalized = code.replace(/\s/g, "");
  if (!/^\d{6}$/.test(normalized)) return false;

  const step = currentTimeStep();
  const secret = base32Decode(base32Secret);

  for (const delta of [0, -1, 1]) {
    if (hotp(secret, step + delta, DIGITS) === normalized) return true;
  }
  return false;
}

export function generateTotpSecret(): string {
  // 20 random bytes = 160 bits, the size RFC 4226 recommends for an HMAC-SHA1
  // key — encodes to a 32-character Base32 string.
  return base32Encode(crypto.randomBytes(20));
}

/** The otpauth:// URI an authenticator app scans to enroll the account. */
export function buildOtpAuthUri(email: string, base32Secret: string, issuer = "Nexoryn Admin"): string {
  const label = encodeURIComponent(`${issuer}:${email}`);
  const params = new URLSearchParams({
    secret: base32Secret,
    issuer,
    algorithm: "SHA1",
    digits: String(DIGITS),
    period: String(PERIOD_SECONDS),
  });
  return `otpauth://totp/${label}?${params.toString()}`;
}
