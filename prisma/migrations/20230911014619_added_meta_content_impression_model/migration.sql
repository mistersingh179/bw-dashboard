-- CreateTable
CREATE TABLE "MetaContentImpression" (
    "id" TEXT NOT NULL,
    "metaContentId" TEXT NOT NULL,
    "auctionId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MetaContentImpression_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "MetaContentImpression_metaContentId_createdAt_idx" ON "MetaContentImpression"("metaContentId", "createdAt" ASC);

-- CreateIndex
CREATE INDEX "MetaContentImpression_auctionId_createdAt_idx" ON "MetaContentImpression"("auctionId", "createdAt" ASC);

-- AddForeignKey
ALTER TABLE "MetaContentImpression" ADD CONSTRAINT "MetaContentImpression_metaContentId_fkey" FOREIGN KEY ("metaContentId") REFERENCES "MetaContent"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MetaContentImpression" ADD CONSTRAINT "MetaContentImpression_auctionId_fkey" FOREIGN KEY ("auctionId") REFERENCES "Auction"("id") ON DELETE CASCADE ON UPDATE CASCADE;
