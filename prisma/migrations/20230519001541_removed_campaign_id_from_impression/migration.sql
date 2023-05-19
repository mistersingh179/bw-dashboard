/*
  Warnings:

  - You are about to drop the column `campaignId` on the `Impression` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Impression" DROP CONSTRAINT "Impression_campaignId_fkey";

-- DropIndex
DROP INDEX "Impression_campaignId_createdAt_idx";

-- AlterTable
ALTER TABLE "Impression" DROP COLUMN "campaignId";
