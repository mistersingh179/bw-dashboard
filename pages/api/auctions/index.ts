import { NextApiHandler, NextApiRequest, NextApiResponse } from "next";
import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/pages/api/auth/[...nextauth]";
import { Middleware, use } from "next-api-middleware";
import allowedMethodMiddlewareFactory from "@/middlewares/allowedMethodMiddlewareFactory";
import withMiddleware from "@/middlewares/my-middleware";

type AuctionResponseData = {
  message: string;
};

const auctions: NextApiHandler<AuctionResponseData> = async (req, res) => {

  if (req.method === "GET") {
    await handleListAuctions(req, res);
  } else if (req.method === "POST") {
    await handleCreateAuction(req, res);
  } else {
    res.status(200).json({ message: "thanks" });
  }
};

const allowedMethodMiddleware: Middleware = allowedMethodMiddlewareFactory([
  "GET",
  "POST",
]);

export default withMiddleware("cors", allowedMethodMiddleware)(auctions);

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

const handleListAuctions = async (
  req: NextApiRequest,
  res: NextApiResponse
) => {
  const session = await getServerSession(req, res, authOptions);
  if (!session) {
    res.status(403).send("sorry access denied");
    return;
  }
  console.log("session: ", session);
  // const user = await prisma.user.findFirstOrThrow({where: {}});
  // const auctions = prisma.auction.findMany({
  //   where: {
  //     user: { id: user.id },
  //   },
  // });
  res.status(200).json({ message: "thanks" });
};

// export const config = {
//   runtime: 'edge',
// }
