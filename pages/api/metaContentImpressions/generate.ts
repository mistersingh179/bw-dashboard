import { NextApiHandler } from "next";
import withMiddleware from "@/middlewares/withMiddleware";
import prisma from "@/lib/prisma";
import superjson from "superjson";
import Cors from "cors";

const cors = Cors({
  credentials: true,
  origin: (requestOrigin, callback) => {
    callback(null, requestOrigin);
  }
});

const generate: NextApiHandler = async (req, res) => {
  const { auctionId, metaContentId, contentHasScroll } = req.body;

  const metaContentImpression = await prisma.metaContentImpression.create({
    data: {
      metaContentId,
      auctionId,
      contentHasScroll
    },
  });

  res
    .setHeader("Content-Type", "application/json")
    .status(200)
    .send(superjson.stringify(metaContentImpression));
};

export default withMiddleware(
  // @ts-ignore
  cors,
  "postOnly",
  "rejectBots",
  "statusOn"
)(generate);
