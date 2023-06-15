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

const getWebpageWithCategories = async (userId: string, url: string) => {
  const webpage: WebpageWithCategories | null = await prisma.webpage.findFirst({
    where: {
      website: {
        userId: userId,
      },
      url: url,
      status: true,
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
      { END_USER_COOKIE_NAME: req.cookies[END_USER_COOKIE_NAME] },
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

  // if(approvedIds.includes(userId) === false){
  //   console.log("not an approved user. failing silently");
  //   res.status(204).end();
  //   return;
  // }

  const { origin, originWithPathName } = getUrlProperties(url);
  const webpage = await getWebpageWithCategories(userId, originWithPathName);

  const auction = await prisma.auction.create({
    data: {
      userId: userId,
      url: originWithPathName,
      endUserCuid: getEndUserCuid(req) ?? createId(),
      endUserFp: fp,
      userAgent: req.headers["user-agent"],
      ip: requestIp.getClientIp(req) ?? "0.0.0.0",
      webpageId: webpage?.id,
    },
  });

  const webpageCategoryNames = webpage?.categories.map((c) => c.name) ?? [];

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

  res
    .setHeader("Content-Type", "application/json")
    .status(200)
    .send(superjson.stringify({ auction, adsWithDetail }));
};

export default withMiddleware(
  // @ts-ignore
  cors,
  "postOnly",
  "rejectBots",
  "statusOn"
)(generate);
