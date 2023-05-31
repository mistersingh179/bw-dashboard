-- AlterTable
ALTER TABLE "Setting" ADD COLUMN     "contentSelector" TEXT NOT NULL DEFAULT 'body p:nth-child(3n)',
ADD COLUMN     "minCharLimit" INTEGER NOT NULL DEFAULT 20,
ADD COLUMN     "sameTypeElemWithTextToFollow" BOOLEAN NOT NULL DEFAULT true,
ALTER COLUMN "desiredAdvertisementCount" SET DEFAULT 1,
ALTER COLUMN "desiredAdvertisementSpotCount" SET DEFAULT 1,
ALTER COLUMN "webpageLookbackDays" SET DEFAULT 5;
