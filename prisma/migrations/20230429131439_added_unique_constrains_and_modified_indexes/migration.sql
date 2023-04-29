/*
  Warnings:

  - A unique constraint covering the columns `[websiteUrlId,beforeText,afterText]` on the table `AdvertisementSpot` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[userId,name]` on the table `Campaign` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[websiteUrlId,campaignId]` on the table `RelevantCampaign` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[userId,url]` on the table `WebsiteUrl` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "Campaign_userId_status_start_end_fixedCpm_idx";

-- DropIndex
DROP INDEX "RelevantCampaign_websiteUrlId_idx";

-- CreateIndex
CREATE INDEX "Advertisement_relevantCampaignId_status_idx" ON "Advertisement"("relevantCampaignId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "AdvertisementSpot_websiteUrlId_beforeText_afterText_key" ON "AdvertisementSpot"("websiteUrlId", "beforeText", "afterText");

-- CreateIndex
CREATE INDEX "Campaign_userId_status_start_end_impressionCap_fixedCpm_idx" ON "Campaign"("userId", "status", "start", "end", "impressionCap", "fixedCpm" DESC);

-- CreateIndex
CREATE UNIQUE INDEX "Campaign_userId_name_key" ON "Campaign"("userId", "name");

-- CreateIndex
CREATE INDEX "RelevantCampaign_websiteUrlId_score_idx" ON "RelevantCampaign"("websiteUrlId", "score");

-- CreateIndex
CREATE UNIQUE INDEX "RelevantCampaign_websiteUrlId_campaignId_key" ON "RelevantCampaign"("websiteUrlId", "campaignId");

-- CreateIndex
CREATE INDEX "WebsiteUrl_userId_url_status_idx" ON "WebsiteUrl"("userId", "url", "status");

-- CreateIndex
CREATE UNIQUE INDEX "WebsiteUrl_userId_url_key" ON "WebsiteUrl"("userId", "url");
