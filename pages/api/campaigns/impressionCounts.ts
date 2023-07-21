import { NextApiHandler, NextApiRequest, NextApiResponse } from "next";
import prisma from "@/lib/prisma";
import { formatISO, parseISO } from "date-fns";
import withMiddleware from "@/middlewares/withMiddleware";
import superjson from "superjson";
import processCampaignQueue from "@/jobs/queues/processCampaignQueue";
import logger from "@/lib/logger";
import getCampaignsWithTheirImpressionCount from "@/services/queries/getCampaignsWithTheirImpressionCount";

const impressionCounts: NextApiHandler = async (req, res) => {
  const userId = req.authenticatedUserId as string;
  const campsWithImpCount = await getCampaignsWithTheirImpressionCount(userId);
  res
    .setHeader("Content-Type", "application/json")
    .status(200)
    .send(superjson.stringify(campsWithImpCount));
};

export default withMiddleware("getOnly", "auth")(impressionCounts);
