-- AlterTable
ALTER TABLE "Setting" ADD COLUMN     "allTimeMostVisitedUrlCount" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "recentlyMostVisitedUrlCount" INTEGER NOT NULL DEFAULT 0;
