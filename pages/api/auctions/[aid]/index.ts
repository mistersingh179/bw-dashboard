import { NextApiHandler, NextApiRequest, NextApiResponse } from "next";
import prisma from "@/lib/prisma";
import { QueryParams } from "@/types/QueryParams";
import withMiddleware from "@/middlewares/withMiddleware";
import { pick } from "lodash";
import { Prisma } from ".prisma/client";
import Cors from "cors";
import AuctionUncheckedUpdateInput = Prisma.AuctionUncheckedUpdateInput;

const cors = Cors({
  credentials: true,
  origin: (requestOrigin, callback) => {
    callback(null, requestOrigin);
  },
});

const auction: NextApiHandler = async (req, res) => {
  if (req.method === "PUT") {
    await handleUpdateAuction(req, res);
  }
};

export default withMiddleware(
  // @ts-ignore
  cors,
  "putOnly",
  "rejectBots",
  "statusOn"
)(auction);

const handleUpdateAuction = async (
  req: NextApiRequest,
  res: NextApiResponse
) => {
  const { aid } = req.query as QueryParams;
  const allowedAttributes = ["scrollPosition", "firstScrollAt"];
  let data = pick<AuctionUncheckedUpdateInput>(req.body, allowedAttributes);
  const auction = await prisma.auction.update({
    where: {
      id: aid,
    },
    data,
  });
  res
    .setHeader("Content-Type", "application/json")
    .status(200)
    .send(JSON.stringify(auction));
};
