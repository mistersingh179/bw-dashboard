-- AlterTable
ALTER TABLE "Setting" ADD COLUMN     "minMetaContentSpotWordLimit" INTEGER NOT NULL DEFAULT 30,
ALTER COLUMN "desiredMetaContentSpotCount" SET DEFAULT 5;
