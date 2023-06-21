-- AlterTable
ALTER TABLE "Setting" ADD COLUMN     "mainPostBodySelector" TEXT NOT NULL DEFAULT 'body',
ALTER COLUMN "webpageLookbackDays" SET DEFAULT 0;

-- CreateIndex
CREATE INDEX "Setting_userId_webpageLookbackDays_idx" ON "Setting"("userId", "webpageLookbackDays");
