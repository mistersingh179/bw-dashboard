/*
  Warnings:

  - You are about to drop the column `scrollDepth` on the `Auction` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Auction" DROP COLUMN "scrollDepth",
ADD COLUMN     "maxScrollDepth" INTEGER;
