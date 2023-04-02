import { NextApiHandler, NextApiRequest, NextApiResponse } from "next";
import { NextRequest } from "next/server";
import Cors from "cors";
import runMiddleware from "@/lib/runMiddleware";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/pages/api/auth/[...nextauth]";

const cors = Cors(); // Initializing the cors middleware

type AuctionResponseData = {
  message: string;
};

const auctions: NextApiHandler<AuctionResponseData> = async (req, res) => {
  await runMiddleware(req, res, cors); // Run the middleware

  if (req.method === "GET") {
    handleListAuctions(req, res);
  } else if (req.method === "POST") {
    handleCreateAuction(req, res);
  } else if (req.method === "DELETE") {
    handleDeleteAuction(req, res);
  } else {
    res.status(200).json({ message: "thanks" });
  }
};

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

const handleDeleteAuction = (
  req: NextApiRequest,
  res: NextApiResponse<AuctionResponseData>
) => {
  res.status(200).json({ message: "deleting an auction" });
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
export default auctions;

// export const config = {
//   runtime: 'edge',
// }
