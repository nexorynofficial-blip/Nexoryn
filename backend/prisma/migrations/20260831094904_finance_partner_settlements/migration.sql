-- AlterTable
ALTER TABLE "Investment" ADD COLUMN     "paidTo" TEXT;

-- CreateIndex
CREATE INDEX "Investment_paidTo_idx" ON "Investment"("paidTo");
