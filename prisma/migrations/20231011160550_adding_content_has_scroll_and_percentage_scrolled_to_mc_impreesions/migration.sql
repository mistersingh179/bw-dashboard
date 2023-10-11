-- AlterTable
ALTER TABLE "MetaContentImpression" ADD COLUMN     "contentHasScroll" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "percentageScrolled" INTEGER NOT NULL DEFAULT 0;
