import { NextApiHandler } from "next";
import { QueryParams } from "@/types/QueryParams";
import withMiddleware from "@/middlewares/withMiddleware";
import prisma from "@/lib/prisma";
import logger from "@/lib/logger";
import superjson from "superjson";

const handler: NextApiHandler = async (req, res) => {
  const query = req.query as QueryParams;
  const uid = query.uid;
  const webpagesCount = await prisma.webpage.count({
    where: {
      website: {
        userId: uid,
      },
    },
  });
  logger.info({ reqId: req.reqId, uid, webpagesCount }, "webpages count");
  // const webpagesWithZeroAdsCount =
  res
    .setHeader("Content-Type", "application/json")
    .status(200)
    .send(superjson.stringify({ webpagesCount }));
};

export default withMiddleware("getOnly", "auth", "canManage")(handler);
