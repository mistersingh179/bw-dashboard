-- CreateTable
CREATE TABLE "MetaContentSpot" (
    "id" TEXT NOT NULL,
    "webpageId" TEXT NOT NULL,
    "contentText" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MetaContentSpot_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "MetaContentSpot_webpageId_idx" ON "MetaContentSpot"("webpageId");

-- AddForeignKey
ALTER TABLE "MetaContentSpot" ADD CONSTRAINT "MetaContentSpot_webpageId_fkey" FOREIGN KEY ("webpageId") REFERENCES "Webpage"("id") ON DELETE CASCADE ON UPDATE CASCADE;
