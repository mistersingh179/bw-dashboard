-- DropIndex
DROP INDEX "AdvertisementSpot_webpageId_beforeText_afterText_key";

-- DropIndex
DROP INDEX "Auction_userId_createdAt_idx";

-- DropIndex
DROP INDEX "Auction_userId_webpageId_createdAt_idx";

-- DropIndex
DROP INDEX "Auction_userId_websiteId_webpageId_createdAt_idx";

-- CreateIndex
CREATE INDEX "Auction_url_idx" ON "Auction"("url");

-- CreateIndex
CREATE INDEX "Auction_websiteId_createdAt_idx" ON "Auction"("websiteId", "createdAt" ASC);
