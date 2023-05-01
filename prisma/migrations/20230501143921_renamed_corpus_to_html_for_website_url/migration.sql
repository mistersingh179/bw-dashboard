/*
  Warnings:

  - You are about to drop the column `corpus` on the `WebsiteUrl` table. All the data in the column will be lost.
  - Added the required column `html` to the `WebsiteUrl` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "WebsiteUrl" DROP COLUMN "corpus",
ADD COLUMN     "html" TEXT NOT NULL;
