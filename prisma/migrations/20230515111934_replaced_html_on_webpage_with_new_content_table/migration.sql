/*
  Warnings:

  - You are about to drop the column `html` on the `Webpage` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Webpage" DROP COLUMN "html";

-- CreateTable
CREATE TABLE "Content" (
    "id" TEXT NOT NULL,
    "webpageId" TEXT NOT NULL,
    "desktopHtml" TEXT NOT NULL,
    "mobileHtml" TEXT,
    "tabletHtml" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Content_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Content_webpageId_key" ON "Content"("webpageId");

-- AddForeignKey
ALTER TABLE "Content" ADD CONSTRAINT "Content_webpageId_fkey" FOREIGN KEY ("webpageId") REFERENCES "Webpage"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
