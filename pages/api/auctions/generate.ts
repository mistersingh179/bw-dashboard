import { NextApiHandler, NextApiRequest } from "next";
import withMiddleware from "@/middlewares/withMiddleware";
import prisma from "@/lib/prisma";
import superjson from "superjson";
import { AdWithDetail } from "@/services/queries/getAdvertisementsForUrl";
import requestIp from "request-ip";
import { Category, Webpage } from ".prisma/client";
import Cors from "cors";
import getCampaignsWhoHaveNotMetImpCap from "@/services/queries/getCamapignsWhoHaveNotMetImpCap";
import cookie from "cookie";
import { createId } from "@paralleldrive/cuid2";
import logger from "@/lib/logger";
import { pick, sample } from "lodash";
import getBestCampaignsForWebpage from "@/services/queries/getBestCampaignsForWebpage";
import processWebpageForAdCreation from "@/services/process/processWebpageForAdCreation";
import getActiveAdsWithDetailForScoredCampaign from "@/services/queries/getActiveAdsWithDetailForScoredCampaign";
import updateBestCampaign from "@/services/updateBestCampaign";
import { MetaContentSpotsWithMetaContentAndType } from "@/services/queries/getWebpageWithAdSpotsAndOtherCounts";
import processWebpageForMetaContentCreation from "@/services/process/processWebpageForMetaContentCreation";
import {
  DIVERSITY_CLASSIFIER,
  META_CONTENT_BUILD_FAIL_COUNT_LIMIT,
} from "@/constants";

const cors = Cors({
  credentials: true,
  origin: (requestOrigin, callback) => {
    callback(null, requestOrigin);
  },
});

type UrlProperties = {
  origin: string;
  originWithPathName: string;
};

export const getUrlProperties = (url: string): UrlProperties => {
  const urlObj = new URL(url);
  const origin = urlObj.origin;
  let originWithPathName = urlObj.origin + urlObj.pathname;
  if (originWithPathName.endsWith("/")) {
    originWithPathName = originWithPathName.slice(0, -1);
  }
  return { origin, originWithPathName };
};

type WebpageWithCategories = Webpage & { categories: Category[] };

const getUserAbortCategories = async (userId: string) => {
  const abortCategories = await prisma.category.findMany({
    where: {
      userId: userId,
      abortScript: true,
    },
  });
  return abortCategories;
};

const getWebsite = async (userId: string, origin: string) => {
  const website = await prisma.website.findFirst({
    where: {
      userId,
      topLevelDomainUrl: origin,
    },
  });
  return website;
};

const getWebpageWithCategories = async (websiteId: string, url: string) => {
  const webpage: WebpageWithCategories | null = await prisma.webpage.findFirst({
    where: {
      websiteId,
      url,
    },
    include: {
      categories: true,
    },
  });
  return webpage;
};

const needsToBuildMetaContent = async (webpageId: string) => {
  const ans = await prisma.metaContentSpot.findMany({
    where: {
      webpageId: webpageId,
      buildFailCount: {
        lt: META_CONTENT_BUILD_FAIL_COUNT_LIMIT,
      },
      metaContents: {
        none: {
          diveristyClassifierResult: DIVERSITY_CLASSIFIER.DIVERSE,
        },
      },
    },
    select: {
      id: true,
    },
    take: 1,
  });
  return ans.length === 1;
};

const getMetaContentSpotsToDisplay = async (
  webpageId: string
): Promise<MetaContentSpotsWithMetaContentAndType[]> => {
  const mcs = await prisma.metaContentSpot.findMany({
    where: {
      webpageId: webpageId,
      metaContents: {
        some: {
          status: true,
          diveristyClassifierResult: DIVERSITY_CLASSIFIER.DIVERSE,
        },
      },
    },
    include: {
      metaContents: {
        where: {
          status: true,
          diveristyClassifierResult: DIVERSITY_CLASSIFIER.DIVERSE,
        },
        include: {
          metaContentType: true,
        },
      },
    },
  });
  return mcs;
};

export const END_USER_COOKIE_NAME: string = "bw-endUserCuid";

const getEndUserCuid = (req: NextApiRequest): string | null => {
  if (req.cookies[END_USER_COOKIE_NAME]) {
    return req.cookies[END_USER_COOKIE_NAME];
  } else {
    return null;
  }
};

const generate: NextApiHandler = async (req, res) => {
  const { userId, url, fp } = req.body;
  const settings = req.settings!;

  let messages: string[] = [];

  const { origin, originWithPathName } = getUrlProperties(url);
  const website = await getWebsite(userId, origin);
  let webpage;
  if (website) {
    webpage = await getWebpageWithCategories(website.id, originWithPathName);
  }
  const webpageCategories = webpage?.categories ?? [];
  const webpageCategoryNames = webpageCategories.map((c) => c.name);

  if (!website) {
    messages.push("website not found – " + origin + " – " + userId);
  }
  if (website?.status === false) {
    messages.push("website is turned OFF – " + origin);
  }
  if (!webpage) {
    messages.push(
      "webpage not found – " + originWithPathName + " – " + website?.id
    );
  }
  if (webpage?.status === false) {
    messages.push("webpage is turned OFF – " + originWithPathName);
  }

  const auction = await prisma.auction.create({
    data: {
      userId: userId,
      url: originWithPathName,
      endUserCuid: getEndUserCuid(req) ?? createId(),
      endUserFp: fp,
      userAgent: req.headers["user-agent"],
      ip: requestIp.getClientIp(req) ?? "0.0.0.0",
      webpageId: webpage?.id,
      websiteId: website?.id,
    },
  });

  const campaignsWhoHaveNotMetImpCap = await getCampaignsWhoHaveNotMetImpCap(
    userId
  );
  const campIdsWhoHaveNotMetImpCap = campaignsWhoHaveNotMetImpCap.map(
    (c) => c.id
  );

  let adsWithDetail: AdWithDetail[] = [];
  let metaContentSpotsWithDetail: MetaContentSpotsWithMetaContentAndType[] = [];

  if (
    settings.status == true &&
    website?.status == true &&
    webpage?.status == true
  ) {
    metaContentSpotsWithDetail = await getMetaContentSpotsToDisplay(webpage.id);

    const hasMissingMetaContent = await needsToBuildMetaContent(webpage.id);
    if (hasMissingMetaContent) {
      messages.push("some spots still need meta content building");
      await processWebpageForMetaContentCreation(webpage);
    } else {
      messages.push("all metaContent building is complete");
    }

    const bestCampaigns = await getBestCampaignsForWebpage(
      webpage.id,
      settings.scoreThreshold,
      campIdsWhoHaveNotMetImpCap,
      webpageCategoryNames,
      settings.bestCampaignCount
    );
    messages.push(
      "best campaigns: " + bestCampaigns.map((sc) => sc.id).join(", ")
    );
    await updateBestCampaign(webpage, bestCampaigns);

    const bestCampaign = sample(bestCampaigns);
    messages.push("the sampled best campaign: " + bestCampaign?.id);

    if (bestCampaign) {
      messages.push("found best campaign");
      adsWithDetail = await getActiveAdsWithDetailForScoredCampaign(
        bestCampaign.id
      );
      if (adsWithDetail.length > 0) {
        messages.push("founds ads on best campaign");
      } else {
        logger.info({}, "no ads found, will try to build it");
        messages.push("no ads found, will try to build it");
        const jobIds = await processWebpageForAdCreation(
          webpage,
          bestCampaign,
          settings
        );
        messages.push("scheduled job to create ads: " + jobIds.join(" | "));
      }
    } else {
      logger.info({}, "best campaign not found");
      messages.push("best campaign not found");
    }
  }

  const cookieHeaderString = cookie.serialize(
    END_USER_COOKIE_NAME,
    auction.endUserCuid,
    {
      httpOnly: true,
      maxAge: 2147483647,
      path: "/",
      // secure: process.env.NODE_ENV === "development" ? false : true,
      sameSite: "none",
      secure: true,
    }
  );
  res.setHeader("Set-Cookie", cookieHeaderString);

  const settingsToReturn = pick(settings, [
    "sponsoredWording",
    "makeLinksBold",
    "customStyles",
    "mainPostBodySelector",
    "metaContentSpotSelector",
  ]);

  const abortCategories = await getUserAbortCategories(userId);
  const abortCategoryNames = abortCategories.map((x) => x.name);

  res
    .setHeader("Content-Type", "application/json")
    .status(200)
    .send(
      superjson.stringify({
        auction,
        adsWithDetail,
        metaContentSpotsWithDetail,
        settings: settingsToReturn,
        abortCategoryNames,
        messages,
      })
    );
};

export default withMiddleware(
  // @ts-ignore
  cors,
  "postOnly",
  "rejectBots",
  "statusOn"
)(generate);
