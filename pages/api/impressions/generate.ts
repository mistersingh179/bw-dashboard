import { NextApiHandler } from "next";
import withMiddleware from "@/middlewares/withMiddleware";
import prisma from "@/lib/prisma";
import requestIp from "request-ip";
import superjson from "superjson";
import Cors from "cors";

const cors = Cors();

const generate: NextApiHandler = async (req, res) => {
  const { auctionId, advertisementId } = req.body;

  const impression = await prisma.impression.create({
    data: {
      advertisementId: advertisementId,
      auctionId: auctionId,
      clicked: false,
    },
  });

  res
    .setHeader("Content-Type", "application/json")
    .status(200)
    .send(superjson.stringify(impression));
};

export default withMiddleware(
  // @ts-ignore
  cors,
  "postOnly",
  "rejectBots",
  "statusOn"
)(generate);
