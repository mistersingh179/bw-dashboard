/*
  Warnings:

  - You are about to drop the column `brandDescription` on the `Campaign` table. All the data in the column will be lost.
  - You are about to drop the column `brandName` on the `Campaign` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Campaign" DROP COLUMN "brandDescription",
DROP COLUMN "brandName",
ADD COLUMN     "productDescription" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "productName" TEXT NOT NULL DEFAULT '';
