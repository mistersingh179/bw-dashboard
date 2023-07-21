import { NextApiHandler, NextApiRequest, NextApiResponse } from "next";
import withMiddleware from "@/middlewares/withMiddleware";
import { QueryParams } from "@/types/QueryParams";
import prisma from "@/lib/prisma";
import superjson from "superjson";
import {Advertisement, AdvertisementSpot, Campaign, ScoredCampaign} from "@prisma/client";

type AdvertisementWithSpotAndCampaign = Advertisement & {
  advertisementSpot: AdvertisementSpot;
  scoredCampaign: ScoredCampaign & { campaign: Campaign };
};

const advertisementsHandler: NextApiHandler = async (req, res) => {
  switch (req.method) {
    case "GET":
      await handleListAdvertisements(req, res);
      break;
  }
};

const handleListAdvertisements = async (
  req: NextApiRequest,
  res: NextApiResponse
) => {
  const { wpid, wsid, scid } = req.query as QueryParams;
  const userId = req.authenticatedUserId as string;

  const advertisements: AdvertisementWithSpotAndCampaign[] = await prisma.advertisement.findMany({
    where: {
      scoredCampaign: {
        id: scid,
        webpage: {
          id: wpid,
          website: {
            id: wsid,
            user: {
              id: userId,
            },
          },
        },
      },
    },
    include: {
      scoredCampaign: {
        include: {
          campaign: true,
        },
      },
      advertisementSpot: true,
    },
  });
  res
    .setHeader("Content-Type", "application/json")
    .status(200)
    .send(superjson.stringify(advertisements));
};

export default withMiddleware("getOnly", "auth")(advertisementsHandler);
