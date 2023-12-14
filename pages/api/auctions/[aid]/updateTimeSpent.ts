import { NextApiHandler } from "next";
import withMiddleware from "@/middlewares/withMiddleware";
import { QueryParams } from "@/types/QueryParams";
import prisma from "@/lib/prisma";
import Cors from "cors";

const cors = Cors({
  credentials: true,
  origin: (requestOrigin, callback) => {
    callback(null, requestOrigin);
  },
});

const updateTimeSpent: NextApiHandler = async (req, res) => {
  const { aid } = req.query as QueryParams;
  const { timeSpent } = req.body;

  const auction = await prisma.auction.update({
    where: {
      id: aid,
    },
    data: {
      timeSpent,
    },
  });

  res
    .setHeader("Content-Type", "application/json")
    .status(200)
    .end();
};

export default withMiddleware(
  // @ts-ignore
  cors,
  "postOnly",
  "rejectBots",
  // "statusOn"
)(updateTimeSpent);
