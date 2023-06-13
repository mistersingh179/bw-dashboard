import { NextApiHandler, NextApiRequest, NextApiResponse } from "next";
import prisma from "@/lib/prisma";
import { formatISO, parseISO } from "date-fns";
import withMiddleware from "@/middlewares/withMiddleware";
import superjson from "superjson";
import processCampaignQueue from "@/jobs/queues/processCampaignQueue";

type AuctionResponseData = {
  message: string;
};

const campaigns: NextApiHandler = async (req, res) => {
  switch (req.method) {
    case "GET":
      await handleListCampaigns(req, res);
      break;
    case "POST":
      await handleCreateCampaign(req, res);
      break;
  }
};

export default withMiddleware("getPostOnly", "auth")(campaigns);

const handleCreateCampaign = async (
  req: NextApiRequest,
  res: NextApiResponse
) => {
  const { start, end } = req.body;
  const startWithTime = formatISO(parseISO(start));
  const endWithTime = formatISO(parseISO(end));
  const campaign = await prisma.campaign.create({
    data: {
      ...req.body,
      start: startWithTime,
      end: endWithTime,
      user: {
        connect: {
          id: req.authenticatedUserId,
        },
      },
    },
  });

  // todo - we should also call a similar job when campaign's product is updated.
  const job = await processCampaignQueue.add("processCampaign", { campaign });
  console.log("job id for processCampaignJob: ", job.id);
  res
    .setHeader("Content-Type", "application/json")
    .status(200)
    .send(superjson.stringify(campaign));
};

const handleListCampaigns = async (
  req: NextApiRequest,
  res: NextApiResponse
) => {
  const campaigns = await prisma.campaign.findMany({
    where: {
      userId: req.authenticatedUserId || "",
    },
    orderBy: {
      id: "asc",
    },
  });
  res
    .setHeader("Content-Type", "application/json")
    .status(200)
    .send(superjson.stringify(campaigns));
};
