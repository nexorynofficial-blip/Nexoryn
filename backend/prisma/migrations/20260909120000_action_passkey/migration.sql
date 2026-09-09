-- Removes the TOTP two-factor columns (feature removed) and adds a single
-- action passkey instead: one secret, generated once from Account Settings,
-- required to approve/reject a finance request and to change the account
-- password. See AdminUser in schema.prisma and src/services/passkey.ts.

ALTER TABLE "AdminUser"
  DROP COLUMN "mfaSecret",
  DROP COLUMN "mfaEnabledAt",
  DROP COLUMN "mfaRecoveryCodes",
  ADD COLUMN "actionPasskeyHash" TEXT,
  ADD COLUMN "actionPasskeySetAt" TIMESTAMP(3);
