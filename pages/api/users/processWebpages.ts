import type { NextApiHandler } from "next";
import prisma from "@/lib/prisma";
import withMiddleware from "@/middlewares/withMiddleware";
import logger from "@/lib/logger";
import processWebpageQueue from "@/jobs/queues/processWebpageQueue";
import processAllExistingWebpages from "@/services/process/processAllExistingWebpages";

const processWebpages: NextApiHandler = async (req, res) => {
  const userIdToProcess = req.body.userIdToProcess ?? "";

  const result = await processAllExistingWebpages(userIdToProcess)

  logger.info({ result }, "exiting webpages have been processed");

  res.setHeader("Content-Type", "application/json").status(200).end();
};

export default withMiddleware("postOnly", "auth", "canManage")(processWebpages);
