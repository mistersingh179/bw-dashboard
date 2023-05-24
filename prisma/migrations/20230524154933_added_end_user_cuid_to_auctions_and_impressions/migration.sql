-- AlterTable
ALTER TABLE "Auction" ADD COLUMN     "endUserCuid" TEXT NOT NULL DEFAULT '';

-- AlterTable
ALTER TABLE "Impression" ADD COLUMN     "endUserCuid" TEXT NOT NULL DEFAULT '';
