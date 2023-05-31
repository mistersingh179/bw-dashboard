-- DropIndex
DROP INDEX "Advertisement_scoredCampaignId_status_idx";

-- DropIndex
DROP INDEX "Campaign_userId_status_start_end_impressionCap_fixedCpm_idx";

-- DropIndex
DROP INDEX "ScoredCampaign_campaignId_idx";

-- DropIndex
DROP INDEX "ScoredCampaign_score_idx";

-- AlterTable
ALTER TABLE "Setting" ADD COLUMN     "desiredAdvertisementCount" INTEGER NOT NULL DEFAULT 3,
ADD COLUMN     "desiredAdvertisementSpotCount" INTEGER NOT NULL DEFAULT 2,
ADD COLUMN     "webpageLookbackDays" INTEGER NOT NULL DEFAULT 90;

-- CreateIndex
CREATE INDEX "Advertisement_advertisementSpotId_scoredCampaignId_status_idx" ON "Advertisement"("advertisementSpotId", "scoredCampaignId", "status");

-- CreateIndex
CREATE INDEX "Campaign_id_start_end_status_fixedCpm_idx" ON "Campaign"("id", "start", "end", "status", "fixedCpm" DESC);

-- CreateIndex
CREATE INDEX "Content_webpageId_idx" ON "Content"("webpageId");

-- CreateIndex
CREATE INDEX "ScoredCampaign_campaignId_score_idx" ON "ScoredCampaign"("campaignId", "score");

-- CreateIndex
CREATE INDEX "ScoredCampaign_score_idx" ON "ScoredCampaign"("score" DESC);

-- CreateIndex
CREATE INDEX "Setting_userId_status_idx" ON "Setting"("userId", "status");
