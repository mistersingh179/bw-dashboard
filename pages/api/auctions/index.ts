import { NextApiHandler, NextApiRequest, NextApiResponse } from "next";
import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/pages/api/auth/[...nextauth]";
import { Middleware, use } from "next-api-middleware";
import allowedMethodMiddlewareFactory from "@/middlewares/allowedMethodMiddlewareFactory";
import withMiddleware from "@/middlewares/withMiddleware";

type AuctionResponseData = {
  message: string;
};

const auctions: NextApiHandler<AuctionResponseData> = async (req, res) => {
  await handleCreateAuction(req, res);
};

const allowedMethodMiddleware: Middleware = allowedMethodMiddlewareFactory([
  "POST",
]);

export default withMiddleware(
  "cors",
  allowedMethodMiddleware,
  "onlyApproved"
)(auctions);

const handleCreateAuction = async (
  req: NextApiRequest,
  res: NextApiResponse<AuctionResponseData>
) => {
  console.log("in handleAuctionPost");
  console.log("req.query: ", req.query);
  console.log("req.body: ", typeof req.body, req.body);
  const { userId, url } = req.body;
  console.log(userId);
  console.log(url);

  const auction = await prisma.auction.create({
    data: {
      userId,
      url,
    },
  });

  res.status(201).json({ message: "creating an auction" });
};

// export const config = {
//   runtime: 'edge',
// }
