import { Prisma, Website } from ".prisma/client";
import prisma from "@/lib/prisma";
import { XMLParser } from "fast-xml-parser";
import fetchContentOfWebpage from "@/services/helpers/fetchContentOfWebpage";
import { hoursToMilliseconds, isAfter, parseISO, subDays } from "date-fns";
import { getUrlProperties } from "@/pages/api/auctions/generate";
import { Setting } from "@prisma/client";
import downloadWebpagesQueue, {
  queueEvents as downloadWebpagesQueueEvents,
} from "@/jobs/queues/downloadWebpagesQueue";
import logger from "@/lib/logger";
import { chunk } from "lodash";
import { WEBPAGE_INSERT_CHUNK_COUNT } from "@/constants";
import {
  getWebsiteInsertCount,
  incrementWebsiteInsertCount,
  setWebsiteInsertCount,
} from "@/lib/websiteInsertCount";
import WebpageCreateManyInput = Prisma.WebpageCreateManyInput;

export type UrlsetUrl = {
  loc: string;
  lastmod: string;
  changefreq?: string;
  priority?: number;
  [key: string]: any;
};

export type SitemapIndexSitemap = {
  loc: string;
  lastmod: string;
  [key: string]: any;
};

export const getCleanUrl = (url: string): string => {
  try {
    const { originWithPathName } = getUrlProperties(url);
    return originWithPathName;
  } catch (err) {
    console.log("got error while cleaning url: ", url);
  }
  return "";
};

const oneHour = hoursToMilliseconds(1);

const myLogger = logger.child({ name: "downloadWebpages" });

type DownloadWebpages = (
  website: Website,
  settings: Setting,
  sitemapUrl?: string
) => Promise<object>;

const downloadWebpages: DownloadWebpages = async (
  website,
  settings,
  sitemapUrl
) => {
  const { topLevelDomainUrl } = website;
  myLogger.info({ website, sitemapUrl }, "starting service");

  const { webpageInsertCap: insertCap } = settings;

  if (sitemapUrl === undefined) {
    myLogger.info("in first call to downloadWebpages as sitemap is undefined");
    sitemapUrl = website.sitemapUrl;
    myLogger.info({ sitemapUrl }, "will use sitemap from website");
    await setWebsiteInsertCount(website, 0);
    myLogger.info("will set website insert count in redis to 0");
  }

  const lookBackDate = subDays(new Date(), settings.webpageLookbackDays);
  myLogger.info({ lookBackDate }, "lookBackDate is");

  if (settings.webpageLookbackDays === 0) {
    myLogger.info({}, "aborting as webpageLookbackDays is set to 0");
    return {};
  }

  let sitemapXML = "";
  try {
    sitemapXML = await fetchContentOfWebpage(sitemapUrl, "application/xml");
  } catch (err) {
    myLogger.error({ err, sitemapUrl }, "aborting as unable to fetch sitemap");
    return {};
  }
  myLogger.info({ sitemapXML }, "got sitemap XML");

  const options = {
    ignoreDeclaration: true,
    ignorePiTags: true,
    isArray: (
      name: string,
      jpath: string,
      isLeafNode: boolean,
      isAttribute: boolean
    ) => {
      if (["urlset.url", "sitemapindex.sitemap"].indexOf(jpath) >= 0) {
        return true;
      } else {
        return false;
      }
    },
  };
  const parser = new XMLParser(options);
  let jsonObj = parser.parse(sitemapXML);

  const latestUrlsReducer = (
    accumulator: WebpageCreateManyInput[],
    currentValue: UrlsetUrl
  ): WebpageCreateManyInput[] => {
    const url = getCleanUrl(currentValue.loc);
    const lastmod = currentValue.lastmod;
    if (currentValue.lastmod) {
      if (isAfter(parseISO(currentValue.lastmod), lookBackDate)) {
        myLogger.info({ sitemapUrl, lastmod, url }, "taking: lastmod recent");
        return [
          ...accumulator,
          {
            websiteId: website.id,
            url,
            status: true,
            lastModifiedAt: lastmod,
          },
        ];
      } else {
        myLogger.info({ sitemapUrl, lastmod, url }, "skip: lastmod not recent");
        return accumulator;
      }
    } else {
      myLogger.info({ url, sitemapUrl }, "skip: lastmod not present");
      return accumulator;
    }
  };

  if (Array.isArray(jsonObj?.urlset?.url)) {
    const urlArray = jsonObj.urlset.url as UrlsetUrl[];
    myLogger.info(
      { length: urlArray.length, sitemapUrl },
      "we have a sitemap with urlset. time to take new urls & insert them"
    );

    const webpageInputs = urlArray.reduce(latestUrlsReducer, []);
    const length = webpageInputs.length;
    myLogger.info({ length }, "webpageInputs after lastmod filter");

    const webpageInputsChunked = chunk(
      webpageInputs,
      WEBPAGE_INSERT_CHUNK_COUNT
    );

    for (const chunk of webpageInputsChunked) {
      const alreadyInsertedCount = await getWebsiteInsertCount(website);
      if (alreadyInsertedCount >= insertCap) {
        myLogger.info({ alreadyInsertedCount, insertCap }, "aborting cap met");
        return;
      }

      const { count: dbInsertedCount } = await prisma.webpage.createMany({
        data: chunk,
        skipDuplicates: true,
      });

      const chunkCount = chunk.length;
      myLogger.info({ dbInsertedCount, chunkCount }, "webpages chunk inserted");

      await incrementWebsiteInsertCount(website, chunkCount);
    }
  } else if (Array.isArray(jsonObj?.sitemapindex?.sitemap)) {
    const sitemapArray = jsonObj.sitemapindex.sitemap as SitemapIndexSitemap[];
    myLogger.info({}, "we have a sitemap of sitemaps");
    const downloadPromises = [];
    for (const sitemapItem of sitemapArray) {
      const job = await downloadWebpagesQueue.add("downloadWebpages", {
        website,
        settings,
        sitemapUrl: sitemapItem.loc,
      });
      const { id } = job;
      myLogger.info(
        { id, url: website.topLevelDomainUrl, sitemapUrl: sitemapItem.loc },
        "scheduled job to downloadWebpages with sitemapUrl"
      );
      const downloadPromise = job.waitUntilFinished(
        downloadWebpagesQueueEvents,
        1 * 24 * 60 * 60 * 1000
      );
      downloadPromises.push(downloadPromise);
    }
    myLogger.info(
      { length: downloadPromises.length },
      "waiting for all downloadWebpages to settle"
    );
    await Promise.allSettled(downloadPromises);
    myLogger.info(
      { length: downloadPromises.length },
      "all downloadWebpages have finished"
    );
  } else {
    myLogger.error({}, "unable to process sitemap");
  }

  return jsonObj;
};

export default downloadWebpages;

if (require.main === module) {
  (async () => {
    const ws = await prisma.website.findFirstOrThrow({
      where: {
        id: "cljizmvtz000198t22ka11nkb",
      },
      include: {
        user: {
          include: {
            setting: true,
          },
        },
      },
    });
    await downloadWebpages(ws, ws.user.setting!);
  })();
}
