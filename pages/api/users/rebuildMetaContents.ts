import type { NextApiHandler } from "next";
import prisma from "@/lib/prisma";
import withMiddleware from "@/middlewares/withMiddleware";
import logger from "@/lib/logger";
import processWebpageQueue from "@/jobs/queues/processWebpageQueue";

const rebuildMetaContents: NextApiHandler = async (req, res) => {
  const userIdToProcess = req.body.userIdToProcess ?? "";

  const result = await prisma.metaContentSpot.deleteMany({
    where: {
      webpage: {
        website: {
          userId: userIdToProcess,
        },
      },
    },
  });

  logger.info({ result }, "meta content spots have been deleted");

  const webpages = await prisma.webpage.findMany({
    where: {
      website: {
        userId: userIdToProcess,
      },
    },
  });

  for (const webpage of webpages) {
    const job = await processWebpageQueue.add("processWebpage", {
      webpage: webpage,
    });
    logger.info({ id: job.id, webpage }, "scheduled job to process Webpage");
  }

  res.setHeader("Content-Type", "application/json").status(200).end();
};

export default withMiddleware("postOnly", "auth", "canManage")(rebuildMetaContents);
