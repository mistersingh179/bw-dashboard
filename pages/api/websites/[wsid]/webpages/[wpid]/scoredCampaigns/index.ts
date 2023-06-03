import {NextApiHandler, NextApiRequest, NextApiResponse} from "next";
import withMiddleware from "@/middlewares/withMiddleware";
import {QueryParams} from "@/types/QueryParams";
import getAdvertisementsForWebpage from "@/services/queries/getAdvertisementsForWebpage";
import superjson from "superjson";
import prisma from "@/lib/prisma";
import {Campaign, ScoredCampaign} from "@prisma/client";

export type ScoredCampaignWithCampaign = ScoredCampaign & {campaign: Campaign};

const scoredCampaignsOfWebpageHandler: NextApiHandler = async (req, res) => {
  switch (req.method) {
    case "GET":
      await handleListScoredCampaigns(req, res);
      break;
  }
};

const handleListScoredCampaigns = async (req: NextApiRequest, res: NextApiResponse) => {
  const { wpid, wsid } = req.query as QueryParams;
  const userId = req.authenticatedUserId as string;
  const { page = 1, pageSize = 10 } = req.query as QueryParams;
  const skip = (Number(page) - 1) * Number(pageSize);
  const take = Number(pageSize);

  const scoredCampaigns: ScoredCampaignWithCampaign[] = await prisma.scoredCampaign.findMany({
    where: {
      webpage: {
        id: wpid,
        website: {
          id: wsid,
          userId: userId
        }
      }
    },
    include: {
      campaign: true
    },
    orderBy: {
      createdAt: "asc",
    },
    take,
    skip,
  })
  res
    .setHeader("Content-Type", "application/json")
    .status(200)
    .send(superjson.stringify(scoredCampaigns));
}


export default withMiddleware("getOnly", "auth")(scoredCampaignsOfWebpageHandler);
