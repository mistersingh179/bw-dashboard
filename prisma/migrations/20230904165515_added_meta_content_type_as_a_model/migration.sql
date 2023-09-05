/*
  Warnings:

  - Added the required column `diveristyClassification` to the `MetaContent` table without a default value. This is not possible if the table is not empty.
  - Added the required column `diveristyClassificationReason` to the `MetaContent` table without a default value. This is not possible if the table is not empty.
  - Added the required column `generatedHeading` to the `MetaContent` table without a default value. This is not possible if the table is not empty.
  - Added the required column `metaContentTypeId` to the `MetaContent` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "MetaContent" ADD COLUMN     "diveristyClassification" TEXT NOT NULL,
ADD COLUMN     "diveristyClassificationReason" TEXT NOT NULL,
ADD COLUMN     "generatedHeading" TEXT NOT NULL,
ADD COLUMN     "metaContentTypeId" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "MetaContentType" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MetaContentType_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "MetaContent_diveristyClassification_idx" ON "MetaContent"("diveristyClassification");

-- AddForeignKey
ALTER TABLE "MetaContent" ADD CONSTRAINT "MetaContent_metaContentTypeId_fkey" FOREIGN KEY ("metaContentTypeId") REFERENCES "MetaContentType"("id") ON DELETE CASCADE ON UPDATE CASCADE;
