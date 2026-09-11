-- Lets an admin propose editing the description of, or deleting, an
-- already-approved (counted) ledger entry — subject to approval from any
-- other admin, same as the existing debt_paid approval flow but with a wider
-- approver pool (any partner other than whoever proposed it, not just a
-- specific counterparty).
ALTER TABLE "Investment"
  ADD COLUMN "pendingChangeType" TEXT,
  ADD COLUMN "pendingDescription" TEXT,
  ADD COLUMN "pendingRequestedBy" TEXT,
  ADD COLUMN "pendingRequestedAt" TIMESTAMP(3);
