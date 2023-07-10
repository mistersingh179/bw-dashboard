-- AlterTable
ALTER TABLE "Auction" ADD COLUMN     "websiteId" TEXT;

-- CreateIndex
CREATE INDEX "Auction_websiteId_idx" ON "Auction"("websiteId");

-- CreateIndex
CREATE INDEX "Auction_createdAt_idx" ON "Auction"("createdAt" ASC);

-- CreateIndex
CREATE INDEX "Auction_userId_websiteId_webpageId_createdAt_idx" ON "Auction"("userId", "websiteId", "webpageId", "createdAt" ASC);

-- AddForeignKey
ALTER TABLE "Auction" ADD CONSTRAINT "Auction_websiteId_fkey" FOREIGN KEY ("websiteId") REFERENCES "Website"("id") ON DELETE CASCADE ON UPDATE CASCADE;
