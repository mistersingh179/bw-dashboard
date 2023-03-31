import { NextApiHandler, NextApiRequest, NextApiResponse } from "next";
import { NextRequest } from "next/server";
import Cors from "cors";
import runMiddleware from "@/lib/runMiddleware";

const cors = Cors(); // Initializing the cors middleware

// export const config = {
//   runtime: 'edge',
// }

type AuctionResponseData = {
  message: string;
};

const auctions: NextApiHandler<AuctionResponseData> = async (req, res) => {

  await runMiddleware(req, res, cors); // Run the middleware

  if (req.method === "POST") {
    handleAuctionPost(req, res);
  } else if (req.method === "DELETE") {
    handleAuctionDelete(req, res);
  } else {
    res.status(200).json({ message: "thanks" });
  }
};

const handleAuctionPost = (
  req: NextApiRequest,
  res: NextApiResponse<AuctionResponseData>
) => {
  res.status(201).json({ message: "creating an auction" });
};

const handleAuctionDelete = (
  req: NextApiRequest,
  res: NextApiResponse<AuctionResponseData>
) => {
  res.status(200).json({ message: "deleting an auction" });
};

export default auctions;
