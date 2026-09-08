-- Session revocation + opt-in TOTP two-factor, on the existing admin table.
ALTER TABLE "AdminUser"
  ADD COLUMN "sessionsValidFrom" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  ADD COLUMN "mfaSecret" TEXT,
  ADD COLUMN "mfaEnabledAt" TIMESTAMP(3),
  ADD COLUMN "mfaRecoveryCodes" TEXT[] DEFAULT ARRAY[]::TEXT[];

-- Roles become load-bearing in this release (see requireRole() in
-- src/middleware/auth.ts). Every account that existed until now had unrestricted
-- access, so promote all of them to "owner" rather than silently revoking
-- finance and PII access from people who have it today. The column default
-- stays "admin", so accounts created from here on start content-only and have
-- to be promoted deliberately.
UPDATE "AdminUser" SET "role" = 'owner';

-- Append-only security/finance audit trail.
CREATE TABLE "AuditLog" (
    "id" TEXT NOT NULL,
    "adminId" TEXT,
    "actor" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "target" TEXT,
    "ip" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "AuditLog_adminId_idx" ON "AuditLog"("adminId");
CREATE INDEX "AuditLog_action_idx" ON "AuditLog"("action");
CREATE INDEX "AuditLog_createdAt_idx" ON "AuditLog"("createdAt");

ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_adminId_fkey"
  FOREIGN KEY ("adminId") REFERENCES "AdminUser"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Persistent rate-limit counters, so limits survive serverless cold starts and
-- hold across every concurrent function instance.
CREATE TABLE "RateLimitHit" (
    "key" TEXT NOT NULL,
    "count" INTEGER NOT NULL DEFAULT 0,
    "expiresAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RateLimitHit_pkey" PRIMARY KEY ("key")
);

CREATE INDEX "RateLimitHit_expiresAt_idx" ON "RateLimitHit"("expiresAt");
