import { NextApiHandler, NextApiRequest, NextApiResponse } from "next";
import { NextRequest } from "next/server";

// export const config = {
//   runtime: 'edge',
// }

type AuctionResponseData = {
  message: string;
};

const auctions: NextApiHandler<AuctionResponseData> = (req, res) => {
  if (req.method === "POST") {
    handleAuctionPost(req, res);
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

export default auctions;
