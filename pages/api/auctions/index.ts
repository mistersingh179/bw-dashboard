import {NextApiHandler, NextApiRequest, NextApiResponse} from "next";
import prisma from "@/lib/prisma";
import withMiddleware from "@/middlewares/withMiddleware";

type AuctionResponseData = {
  message: string;
};

const auctions: NextApiHandler<AuctionResponseData> = async (req, res) => {
  await handleCreateAuction(req, res);
};

export default withMiddleware("cors", "postOnly")(auctions);

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

  const approvedIds = [
    "clfqyzo1z000k98fclzdb0h0e", // me in Dev
    "clfr0fa8y000298df64lsye2t", // me also in Dev
    "clgf6zqrb000098o4yf9pd6hp", // me in Prod
    "clgfp3m6m0000k4084zse2n02", // rod in Prod
  ];
  if (approvedIds.includes(userId)) {
    const auction = await prisma.auction.create({
      data: {
        userId,
        url,
      },
    });

    res.status(201).json({ message: "creating an auction" });
  } else {
    console.log("not an approved user. failing silently");
    res.status(204).end();
  }
};

// export const config = {
//   runtime: 'edge',
// }
