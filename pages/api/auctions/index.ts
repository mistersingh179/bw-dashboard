import {NextApiHandler, NextApiRequest, NextApiResponse} from "next";
import prisma from "@/lib/prisma";
import withMiddleware from "@/middlewares/withMiddleware";
import superjson from "superjson";


const auctions: NextApiHandler = async (req, res) => {
  await handleCreateAuction(req, res);
};

export default withMiddleware("cors", "postOnly")(auctions);

const handleCreateAuction = async (
  req: NextApiRequest,
  res: NextApiResponse
) => {
  console.log("in handleAuctionPost");
  console.log("req.query: ", req.query);
  console.log("req.body: ", typeof req.body, req.body);
  const { userId, url } = req.body;
  console.log(userId);
  console.log(url);

  const approvedIds = [
    "clhtwckif000098wp207rs2fg", // me in Dev
    "clhw27z37000098xy1ylsnlu3", // me also in Dev
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

    res
      .setHeader("Content-Type", "application/json")
      .status(201)
      .send(superjson.stringify({ message: "creating an auction" }));
  } else {
    console.log("not an approved user. failing silently");
    res.status(204).end();
  }
};

// export const config = {
//   runtime: 'edge',
// }
