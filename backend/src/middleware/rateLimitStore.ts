import type { ClientRateLimitInfo, Store } from "express-rate-limit";
import { Prisma } from "@prisma/client";
import { prisma } from "../config/database";

/**
 * A rate-limit store backed by Postgres instead of process memory.
 *
 * express-rate-limit's default MemoryStore counts hits in the memory of a
 * single process. Under Vercel's serverless model that is one *function
 * instance*: counters vanish on every cold start, and concurrent instances
 * each keep their own tally, so an attacker in practice gets some multiple of
 * the configured allowance. For a login form that is the difference between a
 * real brute-force defence and a decorative one.
 *
 * Counting in the database instead makes one limit hold across every instance.
 * It costs one round-trip per counted request, which is why this is used only
 * on the low-volume, security-critical limiters (login, contact) and not on
 * the coarse global one.
 */
export class PrismaRateLimitStore implements Store {
  /** Set by express-rate-limit from the limiter's own `windowMs`. */
  private windowMs = 60_000;

  constructor(private readonly keyPrefix: string) {}

  init(options: { windowMs: number }): void {
    this.windowMs = options.windowMs;
  }

  private namespaced(key: string): string {
    return `${this.keyPrefix}:${key}`;
  }

  async increment(key: string): Promise<ClientRateLimitInfo> {
    const storeKey = this.namespaced(key);
    const expiresAt = new Date(Date.now() + this.windowMs);

    try {
      // One atomic statement: insert the first hit, or bump the existing count
      // — resetting it when the previous window has already lapsed. Doing the
      // read and the write as two statements would let two concurrent requests
      // both read the same count and each write count+1, undercounting exactly
      // when the limiter matters most.
      const rows = await prisma.$queryRaw<{ count: number; expiresAt: Date }[]>(
        Prisma.sql`
          INSERT INTO "RateLimitHit" ("key", "count", "expiresAt")
          VALUES (${storeKey}, 1, ${expiresAt})
          ON CONFLICT ("key") DO UPDATE SET
            "count" = CASE
              WHEN "RateLimitHit"."expiresAt" < NOW() THEN 1
              ELSE "RateLimitHit"."count" + 1
            END,
            "expiresAt" = CASE
              WHEN "RateLimitHit"."expiresAt" < NOW() THEN ${expiresAt}
              ELSE "RateLimitHit"."expiresAt"
            END
          RETURNING "count", "expiresAt"
        `,
      );

      const row = rows[0];
      return {
        totalHits: Number(row?.count ?? 1),
        resetTime: row?.expiresAt ?? expiresAt,
      };
    } catch (error) {
      // Fail open. Every route these limiters guard needs the database anyway,
      // so a database outage already fails the request on its own merits —
      // turning that into a hard lockout for legitimate users would trade a
      // brief outage for a longer one, and gains no security.
      console.error("Rate limit store unavailable, allowing request:", error);
      return { totalHits: 1, resetTime: expiresAt };
    }
  }

  async decrement(key: string): Promise<void> {
    try {
      await prisma.rateLimitHit.updateMany({
        where: { key: this.namespaced(key), count: { gt: 0 } },
        data: { count: { decrement: 1 } },
      });
    } catch {
      // Best effort — a missed decrement can only ever be more restrictive.
    }
  }

  async resetKey(key: string): Promise<void> {
    try {
      await prisma.rateLimitHit.deleteMany({ where: { key: this.namespaced(key) } });
    } catch {
      // Same as above.
    }
  }
}

/** Opportunistic cleanup of lapsed windows, so the table stays small without
 *  needing a scheduled job. Called on a small fraction of requests. */
export async function sweepExpiredRateLimits(): Promise<void> {
  try {
    await prisma.rateLimitHit.deleteMany({ where: { expiresAt: { lt: new Date() } } });
  } catch {
    // Non-critical.
  }
}
