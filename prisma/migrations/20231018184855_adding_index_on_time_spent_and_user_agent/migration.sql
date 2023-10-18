-- CreateIndex
CREATE INDEX "Auction_timeSpent_idx" ON "Auction"("timeSpent");

-- CreateIndex
CREATE INDEX "Auction_userAgent_idx" ON "Auction"("userAgent");

-- CreateIndex
CREATE INDEX "MetaContentImpression_percentageScrolled_idx" ON "MetaContentImpression"("percentageScrolled");

-- CreateIndex
CREATE INDEX "MetaContentImpression_contentHasScroll_idx" ON "MetaContentImpression"("contentHasScroll");

-- CreateIndex
CREATE INDEX "MetaContentImpression_feedbackEmoji_idx" ON "MetaContentImpression"("feedbackEmoji");
