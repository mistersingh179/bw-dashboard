import { NextApiHandler } from "next";
import withMiddleware from "@/middlewares/withMiddleware";
import { getSettings } from "@/pages/api/auctions/generate";
import prisma from "@/lib/prisma";
import requestIp from "request-ip";
import superjson from "superjson";
import Cors from "cors";

const cors = Cors();

const markClicked: NextApiHandler = async (req, res) => {
  const { impressionId } = req.body;

  const impression = await prisma.impression.update({
    where: {
      id: impressionId
    },
    data: {
      clicked: true
    }
  })

  res
    .setHeader("Content-Type", "application/json")
    .status(200)
    .send(superjson.stringify(impression));
};

// @ts-ignore
export default withMiddleware(cors, "postOnly", "rejectBots")(markClicked);
