-- AlterTable
ALTER TABLE "Auction" ADD COLUMN     "endUserFp" TEXT NOT NULL DEFAULT '';

-- AlterTable
ALTER TABLE "Impression" ADD COLUMN     "endUserFp" TEXT NOT NULL DEFAULT '';
