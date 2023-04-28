/*
  Warnings:

  - You are about to drop the column `afterText` on the `Advertisement` table. All the data in the column will be lost.
  - You are about to drop the column `beforeText` on the `Advertisement` table. All the data in the column will be lost.
  - Added the required column `advertisementSpotId` to the `Advertisement` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Advertisement" DROP COLUMN "afterText",
DROP COLUMN "beforeText",
ADD COLUMN     "advertisementSpotId" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "AdvertisementSpot" (
    "id" TEXT NOT NULL,
    "websiteUrlId" TEXT NOT NULL,
    "beforeText" TEXT NOT NULL,
    "afterText" TEXT NOT NULL,
    "status" BOOLEAN NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AdvertisementSpot_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "AdvertisementSpot" ADD CONSTRAINT "AdvertisementSpot_websiteUrlId_fkey" FOREIGN KEY ("websiteUrlId") REFERENCES "WebsiteUrl"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Advertisement" ADD CONSTRAINT "Advertisement_advertisementSpotId_fkey" FOREIGN KEY ("advertisementSpotId") REFERENCES "AdvertisementSpot"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
