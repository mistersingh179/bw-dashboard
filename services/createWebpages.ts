import { Prisma } from ".prisma/client";
import prisma from "@/lib/prisma";
import { XMLParser } from "fast-xml-parser";
import fetchContentOfWebpage from "@/services/helpers/fetchContentOfWebpage";
import WebpageCreateManyWebsiteInput = Prisma.WebpageCreateManyWebsiteInput;
import { isAfter, parseISO, subDays } from "date-fns";
import { getUrlProperties } from "@/pages/api/auctions/generate";
import { Setting } from "@prisma/client";

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

type CreateWebpages = (
  website: string,
  settings: Setting,
  sitemapUrl?: string
) => Promise<void>;

const createWebpages: CreateWebpages = async (
  websiteId: string,
  settings: Setting,
  sitemapUrl
) => {
  const website = await prisma.website.findFirstOrThrow({
    where: {
      id: websiteId,
    },
  });

  if (sitemapUrl === undefined) {
    sitemapUrl = website.sitemapUrl;
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
    const lookBackDate = subDays(new Date(), settings.webpageLookbackDays);
    console.log("lookBackDate is: ", lookBackDate);

    let webpageInputs: WebpageCreateManyWebsiteInput[] = [];
    webpageInputs = urlArray.reduce((accumulator, currentValue) => {
      // todo - is this working
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
        id: websiteId,
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
    for (const item of sitemapArray) {
      await createWebpages(websiteId, settings, item.loc);
    }
  } else {
    console.log("unable to process sitemap");
  }
};

export default createWebpages;

if (require.main === module) {
  (async () => {
    const websites = await prisma.website.findMany({
      include: {
        user: {
          include: {
            setting: true,
          },
        },
      },
    });
    for (const website of websites) {
      try {
        await createWebpages(website.id, website.user.setting!);
      } catch (e) {
        console.error("there was an issue creating webpages for: ", website.id);
      }
    }
    // const website = await prisma.website.findFirstOrThrow({
    //   orderBy: {
    //     id: "asc",
    //   },
    //   where: {
    //     id: "clh58j7rl000z98kwx3diilzx",
    //   },
    // });
    // await createWebpages(website.id);
  })();
}
