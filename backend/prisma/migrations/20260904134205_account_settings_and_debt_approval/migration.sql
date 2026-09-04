-- AlterTable
ALTER TABLE "AdminUser" ADD COLUMN     "partnerName" TEXT;

-- AlterTable
ALTER TABLE "Investment" ADD COLUMN     "approvalStatus" TEXT NOT NULL DEFAULT 'approved',
ADD COLUMN     "decidedAt" TIMESTAMP(3),
ADD COLUMN     "decidedBy" TEXT,
ADD COLUMN     "decisionNote" TEXT;

-- CreateIndex
CREATE INDEX "Investment_approvalStatus_idx" ON "Investment"("approvalStatus");
