-- DropIndex
DROP INDEX "Website_userId_status_idx";

-- CreateTable
CREATE TABLE "Category" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Category_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_CategoryToWebpage" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "_CampaignToCategory" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "_CategoryToWebpage_AB_unique" ON "_CategoryToWebpage"("A", "B");

-- CreateIndex
CREATE INDEX "_CategoryToWebpage_B_index" ON "_CategoryToWebpage"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_CampaignToCategory_AB_unique" ON "_CampaignToCategory"("A", "B");

-- CreateIndex
CREATE INDEX "_CampaignToCategory_B_index" ON "_CampaignToCategory"("B");

-- CreateIndex
CREATE INDEX "Website_userId_status_processedOn_idx" ON "Website"("userId", "status", "processedOn");

-- AddForeignKey
ALTER TABLE "Category" ADD CONSTRAINT "Category_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_CategoryToWebpage" ADD CONSTRAINT "_CategoryToWebpage_A_fkey" FOREIGN KEY ("A") REFERENCES "Category"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_CategoryToWebpage" ADD CONSTRAINT "_CategoryToWebpage_B_fkey" FOREIGN KEY ("B") REFERENCES "Webpage"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_CampaignToCategory" ADD CONSTRAINT "_CampaignToCategory_A_fkey" FOREIGN KEY ("A") REFERENCES "Campaign"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_CampaignToCategory" ADD CONSTRAINT "_CampaignToCategory_B_fkey" FOREIGN KEY ("B") REFERENCES "Category"("id") ON DELETE CASCADE ON UPDATE CASCADE;
