import crypto from "node:crypto";

/**
 * Checks a password against Have I Been Pwned's breach corpus.
 *
 * Uses the k-anonymity range API: only the first five characters of the
 * password's SHA-1 hash ever leave this server. HIBP returns every suffix
 * sharing that prefix (a few hundred), and the comparison happens here — so
 * the password itself, and even its full hash, are never transmitted.
 *
 * Fails open. A password change is a security action a user is taking
 * deliberately, usually in response to a worry; blocking it because a
 * third-party API is unreachable would leave them on the password they were
 * trying to get rid of.
 */
const HIBP_RANGE_URL = "https://api.pwnedpasswords.com/range";
const TIMEOUT_MS = 3000;

/** Number of times the password appears in known breaches. 0 means not found
 *  — including when the lookup could not be completed. */
export async function breachCount(password: string): Promise<number> {
  const sha1 = crypto.createHash("sha1").update(password, "utf8").digest("hex").toUpperCase();
  const prefix = sha1.slice(0, 5);
  const suffix = sha1.slice(5);

  try {
    const response = await fetch(`${HIBP_RANGE_URL}/${prefix}`, {
      headers: {
        // Asked for by HIBP so they can identify traffic; also opts into
        // padded responses, which stop a network observer inferring anything
        // from the size of the reply.
        "Add-Padding": "true",
        "User-Agent": "nexoryn-admin-password-check",
      },
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });

    if (!response.ok) return 0;

    const body = await response.text();
    for (const line of body.split("\n")) {
      const [hashSuffix, count] = line.trim().split(":");
      if (hashSuffix === suffix) return Number(count) || 0;
    }
    return 0;
  } catch (error) {
    console.error("Breached-password lookup unavailable, allowing password:", error);
    return 0;
  }
}

/** True when the password appears in a known breach often enough to be in any
 *  serious cracking wordlist. A handful of appearances can be a coincidence of
 *  a weak-but-obscure string; anything common is a real risk. */
export async function isBreachedPassword(password: string): Promise<boolean> {
  return (await breachCount(password)) > 0;
}
