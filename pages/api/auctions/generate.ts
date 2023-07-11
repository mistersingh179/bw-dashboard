import { NextApiRequest, NextApiResponse } from "next";
import withMiddleware from "@/middlewares/withMiddleware";
import prisma from "@/lib/prisma";
import superjson from "superjson";
import getAdvertisementsForUrl from "@/services/queries/getAdvertisementsForUrl";
import requestIp from "request-ip";
import { Category, Webpage } from ".prisma/client";
import { Setting } from "@prisma/client";
import Cors from "cors";
import getCampaignsWhoHaveNotMetImpCap from "@/services/queries/getCamapignsWhoHaveNotMetImpCap";
import cookie from "cookie";
import { createId } from "@paralleldrive/cuid2";
import logger from "@/lib/logger";
import { pick } from "lodash";

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

// todo - remove this and make a pattern

// const approvedIds = [
//   "clhtwckif000098wp207rs2fg", // me in Dev
//   "clhw27z37000098xy1ylsnlu3", // me also in Dev
//   "clgf6zqrb000098o4yf9pd6hp", // me in Prod
//   "clgfp3m6m0000k4084zse2n02", // rod in Prod
// ];

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

export const END_USER_COOKIE_NAME: string = "bw-endUserCuid";

const getEndUserCuid = (req: NextApiRequest): string | null => {
  if (req.cookies[END_USER_COOKIE_NAME]) {
    logger.info(
      {
        END_USER_COOKIE_NAME: req.cookies[END_USER_COOKIE_NAME],
        reqId: req.reqId,
      },
      "request object has end user cookie"
    );
    return req.cookies[END_USER_COOKIE_NAME];
  } else {
    return null;
  }
};

const generate = async (req: NextApiRequest, res: NextApiResponse) => {
  const { userId, url, fp } = req.body;
  const settings = req.settings!;

  const { origin, originWithPathName } = getUrlProperties(url);
  const website = await getWebsite(userId, origin);
  let webpage;
  if (website) {
    webpage = await getWebpageWithCategories(website.id, originWithPathName);
  }
  const webpageCategories = webpage?.categories ?? [];
  const webpageCategoryNames = webpageCategories.map((c) => c.name);

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

  const adsWithDetail = await getAdvertisementsForUrl({
    userId: userId,
    userScoreThreshold: settings.scoreThreshold,
    categoriesOfWebpage: webpageCategoryNames,
    originWithPathName: originWithPathName,
    origin: origin,
    campIdsWhoHaveNotMetImpCap: campIdsWhoHaveNotMetImpCap,
  });

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

  const settingsToReturn = pick(settings, ["sponsoredWording"]);

  const abortCategories = await getUserAbortCategories(userId);
  const abortCategoryNames = abortCategories.map((x) => x.name);

  res
    .setHeader("Content-Type", "application/json")
    .status(200)
    .send(
      superjson.stringify({
        auction,
        adsWithDetail,
        settings: settingsToReturn,
        abortCategoryNames,
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
