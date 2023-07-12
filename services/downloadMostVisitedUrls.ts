import logger from "@/lib/logger";
import { Prisma, Website } from ".prisma/client";
import { Setting } from "@prisma/client";
import prisma from "@/lib/prisma";
import getMostVisitedUrls from "@/services/queries/getMostVisitedUrls";
import { startOfYesterday } from "date-fns";
import WebpageCreateManyInput = Prisma.WebpageCreateManyInput;

const myLogger = logger.child({ name: "downloadMostVisitedUrls" });

export type MostVisitedUrlsResultType = {
  urls: string[],
  insertCount: number,
}

type DownloadMostVisitedUrls = (
  website: Website,
  settings: Setting
) => Promise<MostVisitedUrlsResultType>;

const downloadMostVisitedUrls: DownloadMostVisitedUrls = async (
  website,
  settings
) => {
  myLogger.info({ website, settings }, "inside service");
  let urls: string[] = [];
  if (settings.allTimeMostVisitedUrlCount > 0) {
    const result = await getMostVisitedUrls(
      website.id,
      settings.allTimeMostVisitedUrlCount
    );
    urls = urls.concat(result);
  }
  if (settings.recentlyMostVisitedUrlCount > 0) {
    const result = await getMostVisitedUrls(
      website.id,
      settings.recentlyMostVisitedUrlCount,
      startOfYesterday()
    );
    urls = urls.concat(result);
  }
  urls = [...new Set(urls)];
  myLogger.info({ website, settings, urls }, "got most visited urls");
  const now = new Date();
  const webpageInput = urls.map<WebpageCreateManyInput>((url) => ({
    websiteId: website.id,
    url: url,
    status: true,
    lastModifiedAt: now,
  }));
  myLogger.info({ website, settings, webpageInput }, "webpageInput");
  const result = await prisma.webpage.createMany({
    data: webpageInput,
    skipDuplicates: true,
  })
  myLogger.info({website, settings, length: result.count}, "most visited urls have been saved");
  return {
    urls,
    insertCount: result.count
  }
};

export default downloadMostVisitedUrls;

if (require.main === module) {
  (async () => {
    const ws = await prisma.website.findFirstOrThrow({
      where: {
        id: "cljyf33m3001h981c0luk5pfj",
      },
      include: {
        user: {
          include: {
            setting: true,
          },
        },
      },
    });
    await downloadMostVisitedUrls(ws, ws.user.setting!);
  })();
}
