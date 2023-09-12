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
  }
});

const setFeedbackEmoji: NextApiHandler = async (req, res) => {
  const { metaContentImpressionId, feedbackEmoji } = req.body;

  const metaContentImpression = await prisma.metaContentImpression.update({
    where: {
      id: metaContentImpressionId
    },
    data: {
      feedbackEmoji
    }
  })

  res
    .setHeader("Content-Type", "application/json")
    .status(200)
    .send(superjson.stringify(metaContentImpression));
};

// @ts-ignore
export default withMiddleware(cors, "postOnly", "rejectBots", "statusOn")(setFeedbackEmoji);
