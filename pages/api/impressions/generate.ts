import { NextApiHandler } from "next";
import withMiddleware from "@/middlewares/withMiddleware";
import { getSettings } from "@/pages/api/auctions/generate";
import prisma from "@/lib/prisma";
import requestIp from "request-ip";
import superjson from "superjson";
import Cors from "cors";

const cors = Cors();

const generate: NextApiHandler = async (req, res) => {
  const { userId, auctionId, advertisementId } = req.body;

  const settings = await getSettings(userId);
  if (settings.status === false) {
    console.log("Aborting as user setting status is off.");
    res.status(204).end();
    return;
  }

  const impression = await prisma.impression.create({
    data: {
      advertisementId: advertisementId,
      auctionId: auctionId,
      userAgent: req.headers["user-agent"] ?? "",
      ip: requestIp.getClientIp(req) ?? "0.0.0.0",
      clicked: false,
    },
  });

  res
    .setHeader("Content-Type", "application/json")
    .status(200)
    .send(superjson.stringify(impression));
};

// @ts-ignore
export default withMiddleware(cors, "postOnly", "rejectBots")(generate);
