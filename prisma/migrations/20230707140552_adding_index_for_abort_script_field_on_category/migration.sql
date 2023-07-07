-- DropIndex
DROP INDEX "Category_userId_idx";

-- CreateIndex
CREATE INDEX "Category_userId_abortScript_idx" ON "Category"("userId", "abortScript");
