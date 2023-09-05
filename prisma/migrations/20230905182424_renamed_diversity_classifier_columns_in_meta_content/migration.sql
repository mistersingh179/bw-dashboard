/*
  Warnings:

  - You are about to drop the column `diveristyClassification` on the `MetaContent` table. All the data in the column will be lost.
  - You are about to drop the column `diveristyClassificationReason` on the `MetaContent` table. All the data in the column will be lost.
  - Added the required column `diveristyClassifierReason` to the `MetaContent` table without a default value. This is not possible if the table is not empty.
  - Added the required column `diveristyClassifierResult` to the `MetaContent` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "MetaContent_diveristyClassification_idx";

-- AlterTable
ALTER TABLE "MetaContent" DROP COLUMN "diveristyClassification",
DROP COLUMN "diveristyClassificationReason",
ADD COLUMN     "diveristyClassifierReason" TEXT NOT NULL,
ADD COLUMN     "diveristyClassifierResult" TEXT NOT NULL;

-- CreateIndex
CREATE INDEX "MetaContent_metaContentTypeId_idx" ON "MetaContent"("metaContentTypeId");

-- CreateIndex
CREATE INDEX "MetaContent_diveristyClassifierResult_idx" ON "MetaContent"("diveristyClassifierResult");
