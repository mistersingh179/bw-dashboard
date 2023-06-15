// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiHandler } from "next";
import prisma from "@/lib/prisma";
import superjson from "superjson";
import withMiddleware from "@/middlewares/withMiddleware";
import processUserQueue from "@/jobs/queues/processUserQueue";
import logger from "@/lib/logger";

const processUser: NextApiHandler = async (req, res) => {
  const { userIdToProcess } = req.body;

  const user = await prisma.user.findFirstOrThrow({
    where: {
      id: userIdToProcess ?? "",
      setting: {
        isNot: null,
      },
    },
    include: {
      setting: true,
    },
  });

  const job = await processUserQueue.add("processUser", {
    user,
    settings: user.setting!,
  });
  logger.info({id: job.id, user}, "scheduled job to process user")

  res
    .setHeader("Content-Type", "application/json")
    .status(202)
    .send(superjson.stringify(job));
};

export default withMiddleware("postOnly", "auth", "canManage")(processUser);
