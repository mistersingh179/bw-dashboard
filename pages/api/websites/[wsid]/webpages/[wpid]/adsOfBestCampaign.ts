import {NextApiHandler} from "next";
import withMiddleware from "@/middlewares/withMiddleware";
import {QueryParams} from "@/types/QueryParams";
import prisma from "@/lib/prisma";
import superjson from "superjson";
import {Advertisement, AdvertisementSpot, Campaign, ScoredCampaign} from "@prisma/client";

export type AdvertisementWithSpotAndCampaign = Advertisement & {
  advertisementSpot: AdvertisementSpot;
  scoredCampaign: ScoredCampaign & { campaign: Campaign };
};

const adsOfBestCampaign: NextApiHandler = async (req, res) => {
  const { wpid, wsid } = req.query as QueryParams;
  const userId =  req.authenticatedUserId as string;

  const advertisements: AdvertisementWithSpotAndCampaign[] = await prisma.advertisement.findMany({
    where: {
      scoredCampaign: {
        isBest: true,
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

}

export default withMiddleware("getOnly", "auth")(adsOfBestCampaign);
