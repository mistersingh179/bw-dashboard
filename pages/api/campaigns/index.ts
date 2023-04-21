import { NextApiHandler, NextApiRequest, NextApiResponse } from "next";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/pages/api/auth/[...nextauth]";
import { Campaign, PrismaClient } from "@prisma/client";
import { formatISO, parseISO } from "date-fns";
import { sleep } from "@/pages/api/dashboard";
import { Middleware } from "next-api-middleware";
import allowedMethodMiddlewareFactory from "@/middlewares/allowedMethodMiddlewareFactory";
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

const allowedMethodMiddleware: Middleware = allowedMethodMiddlewareFactory([
  "GET",
  "POST",
]);

export default withMiddleware(allowedMethodMiddleware, "auth")(campaigns);

const handleCreateCampaign = async (
  req: NextApiRequest,
  res: NextApiResponse<Campaign>
) => {
  const { name, start, end } = req.body;
  const startWithTime = formatISO(parseISO(start));
  const endWithTime = formatISO(parseISO(end));
  await sleep(0);

  const campaign = await prisma.campaign.create({
    data: {
      user: {
        connect: {
          id: req.authenticatedUserId
        }
      },
      start: startWithTime,
      end: endWithTime,
      name,
    },
  });
  res.json(campaign);
};

const handleListCampaigns = async (
  req: NextApiRequest,
  res: NextApiResponse<Campaign[]>
) => {
  await sleep(0);
  const campaigns = await prisma.user
    .findFirstOrThrow({
      where: {
        id: req.authenticatedUserId || "" ,
      },
    })
    .campaigns();
  console.log("campaigns: ", campaigns);
  res.status(200).json(campaigns);
};
