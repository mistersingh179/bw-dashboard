-- DropForeignKey
ALTER TABLE "Content" DROP CONSTRAINT "Content_webpageId_fkey";

-- AddForeignKey
ALTER TABLE "Content" ADD CONSTRAINT "Content_webpageId_fkey" FOREIGN KEY ("webpageId") REFERENCES "Webpage"("id") ON DELETE CASCADE ON UPDATE CASCADE;
