/*
  Warnings:

  - You are about to drop the column `description` on the `InternalProject` table. All the data in the column will be lost.
  - You are about to drop the column `tags` on the `InternalProject` table. All the data in the column will be lost.
  - You are about to drop the column `creditorId` on the `Investment` table. All the data in the column will be lost.
  - Added the required column `actionBy` to the `Investment` table without a default value. This is not possible if the table is not empty.
  - Added the required column `enteredBy` to the `Investment` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Investment" DROP CONSTRAINT "Investment_creditorId_fkey";

-- DropIndex
DROP INDEX "Investment_creditorId_idx";

-- AlterTable
ALTER TABLE "InternalProject" DROP COLUMN "description",
DROP COLUMN "tags",
ADD COLUMN     "note" TEXT;

-- AlterTable
ALTER TABLE "Investment" DROP COLUMN "creditorId",
ADD COLUMN     "actionBy" TEXT NOT NULL,
ADD COLUMN     "enteredBy" TEXT NOT NULL;

-- CreateIndex
CREATE INDEX "Investment_actionBy_idx" ON "Investment"("actionBy");
