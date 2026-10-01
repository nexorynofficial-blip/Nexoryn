-- Social Agent summaries: each run of the local Facebook analysis CLI is
-- pushed to the API and stored here for the admin dashboard.

CREATE TABLE "SocialSummary" (
    "id" TEXT NOT NULL,
    "platform" TEXT NOT NULL DEFAULT 'facebook',
    "status" TEXT NOT NULL,
    "totalActionItems" INTEGER NOT NULL DEFAULT 0,
    "data" JSONB NOT NULL,
    "generatedAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SocialSummary_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "SocialSummary_platform_generatedAt_idx" ON "SocialSummary"("platform", "generatedAt");
