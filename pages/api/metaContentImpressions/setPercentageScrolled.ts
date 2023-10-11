import { NextApiHandler } from "next";
import withMiddleware from "@/middlewares/withMiddleware";
import prisma from "@/lib/prisma";
import requestIp from "request-ip";
import superjson from "superjson";
import Cors from "cors";

const cors = Cors({
  credentials: true,
  origin: (requestOrigin, callback) => {
    callback(null, requestOrigin);
  },
});

const setPercentageScrolled: NextApiHandler = async (req, res) => {
  const { metaContentImpressionId, percentageScrolled } = req.body;

  const metaContentImpression = await prisma.metaContentImpression.update({
    where: {
      id: metaContentImpressionId,
    },
    data: {
      percentageScrolled
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
)(setPercentageScrolled);
