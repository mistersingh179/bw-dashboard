-- DropIndex
DROP INDEX "WebsiteUrl_createdAt_idx";

-- CreateIndex
CREATE INDEX "Advertisement_relevantCampaignId_idx" ON "Advertisement"("relevantCampaignId");

-- CreateIndex
CREATE INDEX "Advertisement_advertisementSpotId_idx" ON "Advertisement"("advertisementSpotId");

-- CreateIndex
CREATE INDEX "AdvertisementSpot_websiteUrlId_idx" ON "AdvertisementSpot"("websiteUrlId");

-- CreateIndex
CREATE INDEX "Auction_userId_idx" ON "Auction"("userId");

-- CreateIndex
CREATE INDEX "Auction_userId_createdAt_idx" ON "Auction"("userId", "createdAt" ASC);

-- CreateIndex
CREATE INDEX "Campaign_userId_idx" ON "Campaign"("userId");

-- CreateIndex
CREATE INDEX "Campaign_userId_status_start_end_fixedCpm_idx" ON "Campaign"("userId", "status", "start", "end", "fixedCpm" DESC);

-- CreateIndex
CREATE INDEX "Impression_campaignId_createdAt_idx" ON "Impression"("campaignId", "createdAt" ASC);

-- CreateIndex
CREATE INDEX "Impression_advertisementId_createdAt_idx" ON "Impression"("advertisementId", "createdAt" ASC);

-- CreateIndex
CREATE INDEX "RelevantCampaign_websiteUrlId_idx" ON "RelevantCampaign"("websiteUrlId");

-- CreateIndex
CREATE INDEX "RelevantCampaign_campaignId_idx" ON "RelevantCampaign"("campaignId");

-- CreateIndex
CREATE INDEX "RelevantCampaign_score_idx" ON "RelevantCampaign"("score");

-- CreateIndex
CREATE INDEX "WebsiteUrl_userId_idx" ON "WebsiteUrl"("userId");

-- CreateIndex
CREATE INDEX "WebsiteUrl_userId_createdAt_idx" ON "WebsiteUrl"("userId", "createdAt" ASC);
