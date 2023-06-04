import { Prisma, Website } from ".prisma/client";
import prisma from "@/lib/prisma";
import { XMLParser } from "fast-xml-parser";
import fetchContentOfWebpage from "@/services/helpers/fetchContentOfWebpage";
import WebpageCreateManyWebsiteInput = Prisma.WebpageCreateManyWebsiteInput;
import { isAfter, parseISO, subDays } from "date-fns";
import { getUrlProperties } from "@/pages/api/auctions/generate";
import { Setting } from "@prisma/client";
import { awaitResult } from "@defer/client";
import downloadWebpagesJob from "@/defer/downloadWebpagesJob";

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

type DownloadWebpages = (
  website: Website,
  settings: Setting,
  sitemapUrl?: string
) => Promise<void>;

const downloadWebpages: DownloadWebpages = async (
  website,
  settings,
  sitemapUrl
) => {
  if (sitemapUrl === undefined) {
    sitemapUrl = website.sitemapUrl;
  }

  const lookBackDate = subDays(new Date(), settings.webpageLookbackDays);
  console.log("lookBackDate is: ", lookBackDate);

  if (settings.webpageLookbackDays === 0) {
    console.log("aborting as webpageLookbackDays is set to 0");
    return;
  }

  let sitemapXML = "";
  try {
    sitemapXML = await fetchContentOfWebpage(sitemapUrl, "application/xml");
  } catch (err) {
    console.log("aborting as unable to fetch sitemap: ", err);
    return;
  }

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
    console.log("we have a sitemap with urlset: ", urlArray.length);

    let webpageInputs: WebpageCreateManyWebsiteInput[] = [];
    webpageInputs = urlArray.reduce((accumulator, currentValue) => {
      if (isAfter(parseISO(currentValue.lastmod), lookBackDate)) {
        console.log("taking as recent: ", currentValue.lastmod);
        return [
          ...accumulator,
          {
            url: getCleanUrl(currentValue.loc),
            lastModifiedAt: currentValue.lastmod,
            status: true,
          },
        ];
      } else {
        console.log("skipping as not recent: ", currentValue.lastmod);
        return accumulator;
      }
    }, webpageInputs);
    console.log("we have webpageInputs: ", webpageInputs.length);

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
    console.log("we have a sitemap of sitemaps");
    const downloadWebpagesJobWithResult = awaitResult(downloadWebpagesJob);
    await Promise.allSettled(
      sitemapArray.map((item) =>
        downloadWebpagesJobWithResult(website, settings, item.loc)
      )
    );
  } else {
    console.log("unable to process sitemap");
  }
};

export default downloadWebpages;

if (require.main === module) {
  (async () => {
    const ws = await prisma.website.findFirstOrThrow({
      where: {
        id: "cliezg4oz008x98f1anu7ip24",
      },
      include: {
        user: {
          include: {
            setting: true,
          },
        },
      },
    });
    await downloadWebpages(
      ws,
      ws.user.setting!,
      "https://citydogmagazine.com/post-sitemap.xml"
    );
  })();
}
