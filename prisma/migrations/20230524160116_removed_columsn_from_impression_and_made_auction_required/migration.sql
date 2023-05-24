/*
  Warnings:

  - You are about to drop the column `endUserCuid` on the `Impression` table. All the data in the column will be lost.
  - You are about to drop the column `endUserFp` on the `Impression` table. All the data in the column will be lost.
  - You are about to drop the column `ip` on the `Impression` table. All the data in the column will be lost.
  - You are about to drop the column `userAgent` on the `Impression` table. All the data in the column will be lost.
  - Made the column `auctionId` on table `Impression` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Impression" DROP COLUMN "endUserCuid",
DROP COLUMN "endUserFp",
DROP COLUMN "ip",
DROP COLUMN "userAgent",
ALTER COLUMN "auctionId" SET NOT NULL;
