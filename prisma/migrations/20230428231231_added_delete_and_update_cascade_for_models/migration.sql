-- DropForeignKey
ALTER TABLE "Advertisement" DROP CONSTRAINT "Advertisement_advertisementSpotId_fkey";

-- DropForeignKey
ALTER TABLE "Advertisement" DROP CONSTRAINT "Advertisement_relevantCampaignId_fkey";

-- DropForeignKey
ALTER TABLE "AdvertisementSpot" DROP CONSTRAINT "AdvertisementSpot_websiteUrlId_fkey";

-- DropForeignKey
ALTER TABLE "Impression" DROP CONSTRAINT "Impression_advertisementId_fkey";

-- DropForeignKey
ALTER TABLE "Impression" DROP CONSTRAINT "Impression_campaignId_fkey";

-- DropForeignKey
ALTER TABLE "RelevantCampaign" DROP CONSTRAINT "RelevantCampaign_campaignId_fkey";

-- DropForeignKey
ALTER TABLE "RelevantCampaign" DROP CONSTRAINT "RelevantCampaign_websiteUrlId_fkey";

-- DropForeignKey
ALTER TABLE "WebsiteUrl" DROP CONSTRAINT "WebsiteUrl_userId_fkey";

-- AddForeignKey
ALTER TABLE "WebsiteUrl" ADD CONSTRAINT "WebsiteUrl_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AdvertisementSpot" ADD CONSTRAINT "AdvertisementSpot_websiteUrlId_fkey" FOREIGN KEY ("websiteUrlId") REFERENCES "WebsiteUrl"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RelevantCampaign" ADD CONSTRAINT "RelevantCampaign_websiteUrlId_fkey" FOREIGN KEY ("websiteUrlId") REFERENCES "WebsiteUrl"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RelevantCampaign" ADD CONSTRAINT "RelevantCampaign_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "Campaign"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Advertisement" ADD CONSTRAINT "Advertisement_relevantCampaignId_fkey" FOREIGN KEY ("relevantCampaignId") REFERENCES "RelevantCampaign"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Advertisement" ADD CONSTRAINT "Advertisement_advertisementSpotId_fkey" FOREIGN KEY ("advertisementSpotId") REFERENCES "AdvertisementSpot"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Impression" ADD CONSTRAINT "Impression_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "Campaign"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Impression" ADD CONSTRAINT "Impression_advertisementId_fkey" FOREIGN KEY ("advertisementId") REFERENCES "Advertisement"("id") ON DELETE CASCADE ON UPDATE CASCADE;
