import { NextApiHandler, NextApiRequest, NextApiResponse } from "next";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/pages/api/auth/[...nextauth]";
import { Campaign, PrismaClient } from "@prisma/client";
import { formatISO, parseISO } from "date-fns";
import { sleep } from "@/pages/api/dashboard";
import { Middleware } from "next-api-middleware";
import allowedMethodMiddlewareFactory from "@/middlewares/allowedMethodMiddlewareFactory";
import withMiddleware from "@/middlewares/my-middleware";

type AuctionResponseData = {
  message: string;
};

const campaigns: NextApiHandler = async (req, res) => {
  if (req.method === "GET") {
    await handleListCampaigns(req, res);
  } else if (req.method === "POST") {
    await handleCreateCampaign(req, res);
  } else {
    res.status(200).json({ message: "thanks" });
  }
};

const allowedMethodMiddleware: Middleware = allowedMethodMiddlewareFactory([
  "GET",
]);

export default withMiddleware(
  allowedMethodMiddleware
)(campaigns);

const handleCreateCampaign = async (
  req: NextApiRequest,
  res: NextApiResponse<Campaign>
) => {
  const session = await getServerSession(req, res, authOptions);
  if (!session) {
    res.status(401).end();
    return;
  }
  console.log(req.body);
  const { name, start, end } = req.body;
  const startWithTime = formatISO(parseISO(start));
  const endWithTime = formatISO(parseISO(end));
  await sleep(0);
  const campaign = await prisma.campaign.create({
    data: {
      userId: session.user.id,
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
  const session = await getServerSession(req, res, authOptions);
  if (!session) {
    res.status(401).end();
    return;
  }
  // await sleep(1000);
  console.log("session: ", session);
  const user = await prisma.user.findFirstOrThrow({
    where: { id: session.user.id },
  });
  console.log("user: ", user);
  const campaigns = await prisma.campaign.findMany({
    where: {
      user: { id: session.user.id },
    },
  });
  console.log("campaigns: ", campaigns);
  res.status(200).json(campaigns);
};
