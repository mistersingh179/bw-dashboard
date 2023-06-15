import {NextApiHandler} from "next";
import prisma from "@/lib/prisma";
import withMiddleware from "@/middlewares/withMiddleware";
import superjson from "superjson";

const dashboard: NextApiHandler = async (req, res) => {

  const auctionsCount = await prisma.auction.aggregate({
    _count: true,
    where: {
      userId: req.authenticatedUserId || ""
    },
  })

  res
    .setHeader("Content-Type", "application/json")
    .status(200)
    .send(superjson.stringify({ auctionsCount: auctionsCount._count }));
};

export default withMiddleware(
  "getOnly", "auth"
)(dashboard);
