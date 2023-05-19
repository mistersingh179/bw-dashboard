/*
  Warnings:

  - You are about to drop the column `url` on the `Impression` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Auction" ADD COLUMN     "ip" INET NOT NULL DEFAULT '0.0.0.0',
ADD COLUMN     "userAgent" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "webpageId" TEXT,
ALTER COLUMN "url" DROP NOT NULL;

-- AlterTable
ALTER TABLE "Impression" DROP COLUMN "url",
ADD COLUMN     "auctionId" TEXT;

-- CreateIndex
CREATE INDEX "Auction_userId_webpageId_createdAt_idx" ON "Auction"("userId", "webpageId", "createdAt" ASC);

-- CreateIndex
CREATE INDEX "Impression_auctionId_createdAt_idx" ON "Impression"("auctionId", "createdAt" ASC);

-- AddForeignKey
ALTER TABLE "Auction" ADD CONSTRAINT "Auction_webpageId_fkey" FOREIGN KEY ("webpageId") REFERENCES "Webpage"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Impression" ADD CONSTRAINT "Impression_auctionId_fkey" FOREIGN KEY ("auctionId") REFERENCES "Auction"("id") ON DELETE CASCADE ON UPDATE CASCADE;
