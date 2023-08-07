-- AlterTable
ALTER TABLE "Auction" ADD COLUMN     "extra" TEXT;

-- CreateIndex
CREATE INDEX "Auction_extra_idx" ON "Auction"("extra");
