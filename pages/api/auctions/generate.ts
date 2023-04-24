import { NextApiHandler, NextApiRequest, NextApiResponse } from "next";
import withMiddleware from "@/middlewares/withMiddleware";
import prisma from "@/lib/prisma";
import Cors from "cors";
import corsMiddleware from "@/middlewares/corsMiddleware";
import isbot from "isbot";

const cors = Cors();

const userLookup = async (userId: string) => {
  const user = await prisma.user.findFirstOrThrow({
    where: {
      id: userId,
    },
  });
  console.log("looked up user: ", user);
  return user;
};

const generate = async (req: NextApiRequest, res: NextApiResponse) => {
  const { userId, url } = req.body;
  const user = await userLookup(userId);
  const now = new Date();
  const campaigns = await prisma.campaign.findMany({
    where: {
      userId: userId,
      start: {
        lte: now,
      },
      end: {
        gt: now,
      },
      status: true,
    },
  });
  console.log("currently running campaigns: ", campaigns);

  res.json({ message: "thanks" });
};

// @ts-ignore
export default withMiddleware(cors, "postOnly", "rejectBots")(generate);
