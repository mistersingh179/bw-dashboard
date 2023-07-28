import type { NextApiHandler } from "next";
import prisma from "@/lib/prisma";
import withMiddleware from "@/middlewares/withMiddleware";
import logger from "@/lib/logger";
import processWebpageQueue from "@/jobs/queues/processWebpageQueue";

const deleteAllAuctions: NextApiHandler = async (req, res) => {
  const userIdToProcess = req.body.userIdToProcess ?? "";

  const result = await prisma.auction.deleteMany({
    where: {
      userId: userIdToProcess,
    },
  });

  logger.info({ result }, "auctions have been deleted");

  res.setHeader("Content-Type", "application/json").status(200).end();
};

export default withMiddleware(
  "postOnly",
  "auth",
  "canManage"
)(deleteAllAuctions);
