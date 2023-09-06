/*
  Warnings:

  - You are about to drop the column `metaContentSelector` on the `Setting` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Setting" DROP COLUMN "metaContentSelector",
ADD COLUMN     "metaContentSpotSelector" TEXT NOT NULL DEFAULT 'body p';
