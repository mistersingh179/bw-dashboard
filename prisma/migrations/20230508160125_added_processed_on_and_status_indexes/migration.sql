-- AlterTable
ALTER TABLE "Website" ADD COLUMN     "processedOn" TIMESTAMP(3);

-- CreateIndex
CREATE INDEX "Webpage_websiteId_status_idx" ON "Webpage"("websiteId", "status");

-- CreateIndex
CREATE INDEX "Website_userId_status_idx" ON "Website"("userId", "status");
