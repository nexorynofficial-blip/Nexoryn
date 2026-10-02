-- Admin decisions on the Social Agent's suggested replies.

CREATE TABLE "SocialAction" (
    "id" TEXT NOT NULL,
    "platform" TEXT NOT NULL DEFAULT 'facebook',
    "itemType" TEXT NOT NULL,
    "itemId" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "editedText" TEXT,
    "adminId" TEXT NOT NULL,
    "actorName" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SocialAction_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "SocialAction_platform_itemId_idx" ON "SocialAction"("platform", "itemId");
