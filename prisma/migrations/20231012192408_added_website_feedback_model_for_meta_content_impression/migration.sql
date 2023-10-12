-- CreateTable
CREATE TABLE "WebsiteFeedback" (
    "id" TEXT NOT NULL,
    "metaContentImpressionId" TEXT,
    "experienceEnhanced" TEXT,
    "contentRelevant" TEXT,
    "optOut" BOOLEAN NOT NULL DEFAULT false,
    "specificExamplesText" TEXT,
    "suggesstionsText" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WebsiteFeedback_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "WebsiteFeedback_metaContentImpressionId_createdAt_idx" ON "WebsiteFeedback"("metaContentImpressionId", "createdAt" ASC);

-- CreateIndex
CREATE INDEX "WebsiteFeedback_optOut_idx" ON "WebsiteFeedback"("optOut");

-- AddForeignKey
ALTER TABLE "WebsiteFeedback" ADD CONSTRAINT "WebsiteFeedback_metaContentImpressionId_fkey" FOREIGN KEY ("metaContentImpressionId") REFERENCES "MetaContentImpression"("id") ON DELETE CASCADE ON UPDATE CASCADE;
