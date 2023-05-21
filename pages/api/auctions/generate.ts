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

export const getSettings = async (userId: string): Promise<Setting> => {
  const settings = await prisma.setting.findFirstOrThrow({
    where: {
      userId: userId,
    },
  });
  return settings;
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

const generate = async (req: NextApiRequest, res: NextApiResponse) => {
  const { userId, url } = req.body;

  const settings = await getSettings(userId);
  if (settings.status === false) {
    console.log("Aborting as user setting status is off.");
    res.status(204).end();
    return;
  }

  const { origin, originWithPathName } = getUrlProperties(url);
  const webpage = await getWebpageWithCategories(userId, originWithPathName);

  const auction = await prisma.auction.create({
    data: {
      userId: userId,
      url: originWithPathName,
      userAgent: req.headers["user-agent"],
      ip: requestIp.getClientIp(req) ?? "0.0.0.0",
      webpageId: webpage?.id,
    },
  });

  const webpageCategoryNames = webpage?.categories.map((c) => c.name) ?? [];

  const campaignsWhoHaveNotMetImpCap = await getCampaignsWhoHaveNotMetImpCap(userId);
  const campIdsWhoHaveNotMetImpCap = campaignsWhoHaveNotMetImpCap.map(c => c.id);

  const adsWithSpots = await getAdvertisementsForUrl({
    userId: userId,
    userScoreThreshold: settings.scoreThreshold,
    categoriesOfWebpage: webpageCategoryNames,
    originWithPathName: originWithPathName,
    origin: origin,
    campIdsWhoHaveNotMetImpCap: campIdsWhoHaveNotMetImpCap,
  });

  res
    .setHeader("Content-Type", "application/json")
    .status(200)
    .send(superjson.stringify({ auction, adsWithSpots }));
};

// @ts-ignore
export default withMiddleware(cors, "postOnly", "rejectBots")(generate);
