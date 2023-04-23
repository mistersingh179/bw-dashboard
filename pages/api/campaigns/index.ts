import { NextApiHandler, NextApiRequest, NextApiResponse } from "next";
import prisma from "@/lib/prisma";
import { Campaign } from "@prisma/client";
import { formatISO, parseISO } from "date-fns";
import withMiddleware from "@/middlewares/withMiddleware";

type AuctionResponseData = {
  message: string;
};

const campaigns: NextApiHandler = async (req, res) => {
  if (req.method === "GET") {
    await handleListCampaigns(req, res);
  } else if (req.method === "POST") {
    await handleCreateCampaign(req, res);
  }
};

export default withMiddleware("getPostOnly", "auth")(campaigns);

const handleCreateCampaign = async (
  req: NextApiRequest,
  res: NextApiResponse<Campaign>
) => {
  const { start, end } = req.body;
  const startWithTime = formatISO(parseISO(start));
  const endWithTime = formatISO(parseISO(end));

  const campaign = await prisma.campaign.create({
    data: {
      user: {
        connect: {
          id: req.authenticatedUserId,
        },
      },
      ...req.body,
      start: startWithTime,
      end: endWithTime,
    },
  });
  res.json(campaign);
};

const handleListCampaigns = async (
  req: NextApiRequest,
  res: NextApiResponse<Campaign[]>
) => {
  const campaigns = await prisma.user
    .findFirstOrThrow({
      where: {
        id: req.authenticatedUserId || "",
      },
    })
    .campaigns();
  console.log("campaigns: ", campaigns);
  res.status(200).json(campaigns);
};
