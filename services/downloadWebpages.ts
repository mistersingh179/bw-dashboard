import { Prisma, Website } from ".prisma/client";
import prisma from "@/lib/prisma";
import { XMLParser } from "fast-xml-parser";
import fetchContentOfWebpage from "@/services/helpers/fetchContentOfWebpage";
import { isAfter, parseISO, subDays } from "date-fns";
import { getUrlProperties } from "@/pages/api/auctions/generate";
import { Setting } from "@prisma/client";
import downloadWebpagesQueue, {
  queueEvents as downloadWebpagesQueueEvents,
} from "@/jobs/queues/downloadWebpagesQueue";
import WebpageCreateManyWebsiteInput = Prisma.WebpageCreateManyWebsiteInput;
import logger from "@/lib/logger";

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
  myLogger.info(
    { url: website.topLevelDomainUrl, sitemapUrl },
    "started service"
  );

  if (sitemapUrl === undefined) {
    sitemapUrl = website.sitemapUrl;
    myLogger.info(
      { sitemapUrl },
      "using sitemap url of website as started at top with undefined"
    );
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

  if (Array.isArray(jsonObj?.urlset?.url)) {
    const urlArray = jsonObj.urlset.url as UrlsetUrl[];
    myLogger.info(
      { length: urlArray.length, sitemapUrl },
      "we have a sitemap with urlset"
    );

    let webpageInputs: WebpageCreateManyWebsiteInput[] = [];
    webpageInputs = urlArray.reduce((accumulator, currentValue) => {
      if (currentValue.lastmod) {
        if (isAfter(parseISO(currentValue.lastmod), lookBackDate)) {
          myLogger.info(
            {
              sitemapUrl,
              lastmod: currentValue.lastmod,
              url: getCleanUrl(currentValue.loc),
            },
            "taking as recent"
          );
          return [
            ...accumulator,
            {
              url: getCleanUrl(currentValue.loc),
              lastModifiedAt: currentValue.lastmod,
              status: true,
            },
          ];
        } else {
          myLogger.info(
            {
              sitemapUrl,
              lastmod: currentValue.lastmod,
              url: getCleanUrl(currentValue.loc),
            },
            "skipping as lastmod is not recent"
          );
          return accumulator;
        }
      } else {
        myLogger.info(
          { url: getCleanUrl(currentValue.loc), sitemapUrl },
          "skipping as lastmod date NOT present"
        );
        return accumulator;
      }
    }, webpageInputs);

    myLogger.info({ length: webpageInputs.length }, "we have webpageInputs");

    await prisma.website.update({
      where: {
        id: website.id,
      },
      data: {
        webpages: {
          createMany: {
            data: webpageInputs,
            skipDuplicates: true,
          },
        },
      },
    });
  } else if (Array.isArray(jsonObj?.sitemapindex?.sitemap)) {
    const sitemapArray = jsonObj.sitemapindex.sitemap as SitemapIndexSitemap[];
    myLogger.info({}, "we have a sitemap of sitemaps");

    const downloadPromises = [];
    for (const sitemapItem of sitemapArray) {
      myLogger.info(
        { sitemapUrl: sitemapItem.loc },
        "scheduling downloadWebpages with nested sitemap url: "
      );
      const job = await downloadWebpagesQueue.add("downloadWebpages", {
        website,
        settings,
        sitemapUrl: sitemapItem.loc,
      });
      myLogger.info(
        { job, url: website.topLevelDomainUrl, sitemapUrl: sitemapItem.loc },
        "scheduled job to download webpages from nested sitemap"
      );
      const downloadPromise = job.waitUntilFinished(
        downloadWebpagesQueueEvents,
        1 * 24 * 60 * 60 * 1000
      );
      downloadPromises.push(downloadPromise);
    }
    await Promise.allSettled(downloadPromises);
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
        id: "cliuhtdc4000v98ul85yvnzm5",
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
