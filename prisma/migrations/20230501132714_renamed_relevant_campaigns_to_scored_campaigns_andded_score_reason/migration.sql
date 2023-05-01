/*
  Warnings:

  - You are about to drop the column `relevantCampaignId` on the `Advertisement` table. All the data in the column will be lost.
  - You are about to drop the `RelevantCampaign` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `scoredCampaignId` to the `Advertisement` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Advertisement" DROP CONSTRAINT "Advertisement_relevantCampaignId_fkey";

-- DropForeignKey
ALTER TABLE "RelevantCampaign" DROP CONSTRAINT "RelevantCampaign_campaignId_fkey";

-- DropForeignKey
ALTER TABLE "RelevantCampaign" DROP CONSTRAINT "RelevantCampaign_websiteUrlId_fkey";

-- DropIndex
DROP INDEX "Advertisement_relevantCampaignId_idx";

-- DropIndex
DROP INDEX "Advertisement_relevantCampaignId_status_idx";

-- AlterTable
ALTER TABLE "Advertisement" DROP COLUMN "relevantCampaignId",
ADD COLUMN     "scoredCampaignId" TEXT NOT NULL;

-- DropTable
DROP TABLE "RelevantCampaign";

-- CreateTable
CREATE TABLE "ScoredCampaign" (
    "id" TEXT NOT NULL,
    "websiteUrlId" TEXT NOT NULL,
    "campaignId" TEXT NOT NULL,
    "score" INTEGER NOT NULL,
    "reason" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ScoredCampaign_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ScoredCampaign_websiteUrlId_score_idx" ON "ScoredCampaign"("websiteUrlId", "score");

-- CreateIndex
CREATE INDEX "ScoredCampaign_campaignId_idx" ON "ScoredCampaign"("campaignId");

-- CreateIndex
CREATE INDEX "ScoredCampaign_score_idx" ON "ScoredCampaign"("score");

-- CreateIndex
CREATE UNIQUE INDEX "ScoredCampaign_websiteUrlId_campaignId_key" ON "ScoredCampaign"("websiteUrlId", "campaignId");

-- CreateIndex
CREATE INDEX "Advertisement_scoredCampaignId_idx" ON "Advertisement"("scoredCampaignId");

-- CreateIndex
CREATE INDEX "Advertisement_scoredCampaignId_status_idx" ON "Advertisement"("scoredCampaignId", "status");

-- AddForeignKey
ALTER TABLE "ScoredCampaign" ADD CONSTRAINT "ScoredCampaign_websiteUrlId_fkey" FOREIGN KEY ("websiteUrlId") REFERENCES "WebsiteUrl"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ScoredCampaign" ADD CONSTRAINT "ScoredCampaign_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "Campaign"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Advertisement" ADD CONSTRAINT "Advertisement_scoredCampaignId_fkey" FOREIGN KEY ("scoredCampaignId") REFERENCES "ScoredCampaign"("id") ON DELETE CASCADE ON UPDATE CASCADE;
