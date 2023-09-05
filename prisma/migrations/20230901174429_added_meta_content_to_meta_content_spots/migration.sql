-- CreateTable
CREATE TABLE "MetaContent" (
    "id" TEXT NOT NULL,
    "metaContentSpotId" TEXT NOT NULL,
    "generatedText" TEXT NOT NULL,
    "status" BOOLEAN NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MetaContent_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "MetaContent_status_idx" ON "MetaContent"("status");

-- CreateIndex
CREATE INDEX "MetaContent_metaContentSpotId_idx" ON "MetaContent"("metaContentSpotId");

-- AddForeignKey
ALTER TABLE "MetaContent" ADD CONSTRAINT "MetaContent_metaContentSpotId_fkey" FOREIGN KEY ("metaContentSpotId") REFERENCES "MetaContentSpot"("id") ON DELETE CASCADE ON UPDATE CASCADE;
