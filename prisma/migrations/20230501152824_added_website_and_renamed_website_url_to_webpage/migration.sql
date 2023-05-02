/*
  Warnings:

  - You are about to drop the column `websiteUrlId` on the `AdvertisementSpot` table. All the data in the column will be lost.
  - You are about to drop the column `websiteUrlId` on the `ScoredCampaign` table. All the data in the column will be lost.
  - You are about to drop the `WebsiteUrl` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[webpageId,beforeText,afterText]` on the table `AdvertisementSpot` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[webpageId,campaignId]` on the table `ScoredCampaign` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `webpageId` to the `AdvertisementSpot` table without a default value. This is not possible if the table is not empty.
  - Added the required column `webpageId` to the `ScoredCampaign` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "AdvertisementSpot" DROP CONSTRAINT "AdvertisementSpot_websiteUrlId_fkey";

-- DropForeignKey
ALTER TABLE "ScoredCampaign" DROP CONSTRAINT "ScoredCampaign_websiteUrlId_fkey";

-- DropForeignKey
ALTER TABLE "WebsiteUrl" DROP CONSTRAINT "WebsiteUrl_userId_fkey";

-- DropIndex
DROP INDEX "AdvertisementSpot_websiteUrlId_beforeText_afterText_key";

-- DropIndex
DROP INDEX "AdvertisementSpot_websiteUrlId_idx";

-- DropIndex
DROP INDEX "ScoredCampaign_websiteUrlId_campaignId_key";

-- DropIndex
DROP INDEX "ScoredCampaign_websiteUrlId_score_idx";

-- AlterTable
ALTER TABLE "AdvertisementSpot" DROP COLUMN "websiteUrlId",
ADD COLUMN     "webpageId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "ScoredCampaign" DROP COLUMN "websiteUrlId",
ADD COLUMN     "webpageId" TEXT NOT NULL;

-- DropTable
DROP TABLE "WebsiteUrl";

-- CreateTable
CREATE TABLE "Website" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "topLevelDomainUrl" TEXT NOT NULL,
    "sitemapUrl" TEXT NOT NULL,
    "status" BOOLEAN NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Website_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Webpage" (
    "id" TEXT NOT NULL,
    "websiteId" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "html" TEXT NOT NULL,
    "status" BOOLEAN NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Webpage_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Website_userId_topLevelDomainUrl_status_idx" ON "Website"("userId", "topLevelDomainUrl", "status");

-- CreateIndex
CREATE INDEX "Website_userId_idx" ON "Website"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Website_userId_topLevelDomainUrl_key" ON "Website"("userId", "topLevelDomainUrl");

-- CreateIndex
CREATE INDEX "Webpage_websiteId_idx" ON "Webpage"("websiteId");

-- CreateIndex
CREATE INDEX "Webpage_websiteId_url_status_idx" ON "Webpage"("websiteId", "url", "status");

-- CreateIndex
CREATE INDEX "Webpage_websiteId_createdAt_idx" ON "Webpage"("websiteId", "createdAt" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "Webpage_websiteId_url_key" ON "Webpage"("websiteId", "url");

-- CreateIndex
CREATE INDEX "AdvertisementSpot_webpageId_idx" ON "AdvertisementSpot"("webpageId");

-- CreateIndex
CREATE UNIQUE INDEX "AdvertisementSpot_webpageId_beforeText_afterText_key" ON "AdvertisementSpot"("webpageId", "beforeText", "afterText");

-- CreateIndex
CREATE INDEX "ScoredCampaign_webpageId_score_idx" ON "ScoredCampaign"("webpageId", "score");

-- CreateIndex
CREATE UNIQUE INDEX "ScoredCampaign_webpageId_campaignId_key" ON "ScoredCampaign"("webpageId", "campaignId");

-- AddForeignKey
ALTER TABLE "Website" ADD CONSTRAINT "Website_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Webpage" ADD CONSTRAINT "Webpage_websiteId_fkey" FOREIGN KEY ("websiteId") REFERENCES "Website"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AdvertisementSpot" ADD CONSTRAINT "AdvertisementSpot_webpageId_fkey" FOREIGN KEY ("webpageId") REFERENCES "Webpage"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ScoredCampaign" ADD CONSTRAINT "ScoredCampaign_webpageId_fkey" FOREIGN KEY ("webpageId") REFERENCES "Webpage"("id") ON DELETE CASCADE ON UPDATE CASCADE;
