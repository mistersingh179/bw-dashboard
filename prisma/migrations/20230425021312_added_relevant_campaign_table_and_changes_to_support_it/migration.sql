/*
  Warnings:

  - You are about to drop the column `websiteUrlId` on the `Advertisement` table. All the data in the column will be lost.
  - Added the required column `relevantCampaignId` to the `Advertisement` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Advertisement" DROP CONSTRAINT "Advertisement_websiteUrlId_fkey";

-- AlterTable
ALTER TABLE "Advertisement" DROP COLUMN "websiteUrlId",
ADD COLUMN     "relevantCampaignId" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "RelevantCampaign" (
    "id" TEXT NOT NULL,
    "websiteUrlId" TEXT NOT NULL,
    "campaignId" TEXT NOT NULL,
    "score" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RelevantCampaign_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "RelevantCampaign" ADD CONSTRAINT "RelevantCampaign_websiteUrlId_fkey" FOREIGN KEY ("websiteUrlId") REFERENCES "WebsiteUrl"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RelevantCampaign" ADD CONSTRAINT "RelevantCampaign_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "Campaign"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Advertisement" ADD CONSTRAINT "Advertisement_relevantCampaignId_fkey" FOREIGN KEY ("relevantCampaignId") REFERENCES "RelevantCampaign"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
