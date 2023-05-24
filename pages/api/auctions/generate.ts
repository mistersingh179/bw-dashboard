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

export const cors = Cors();

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

const getWebpageWithCategories = async (userId: string, url: string) => {
  const webpage: WebpageWithCategories | null = await prisma.webpage.findFirst({
    where: {
      url: url,
      website: {
        userId: userId,
      },
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
    console.log("got cookies: ", req.cookies[END_USER_COOKIE_NAME]);
    return req.cookies[END_USER_COOKIE_NAME];
  }else{
    return null;
  }
}

const generate = async (req: NextApiRequest, res: NextApiResponse) => {

  const { userId, url, fp } = req.body;
  const settings = req.settings!;

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

  const adsWithSpots = await getAdvertisementsForUrl({
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
      httpOnly: process.env.NODE_ENV === "development" ? false : true,
      maxAge: 2147483647,
      path: "/",
      secure: process.env.NODE_ENV === "development" ? false : true,
    }
  );
  res.setHeader("Set-Cookie", cookieHeaderString);

  res
    .setHeader("Content-Type", "application/json")
    .status(200)
    .send(superjson.stringify({ auction, adsWithSpots }));
};

export default withMiddleware(
  // @ts-ignore
  cors,
  "postOnly",
  "rejectBots",
  "statusOn"
)(generate);
