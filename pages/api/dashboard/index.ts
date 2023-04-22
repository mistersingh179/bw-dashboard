import {NextApiHandler} from "next";
import prisma from "@/lib/prisma";
import withMiddleware from "@/middlewares/withMiddleware";


type DashboardResponseData = {
  auctionsCount: Number;
};

const dashboard: NextApiHandler<DashboardResponseData> = async (req, res) => {

  const auctionsCount = await prisma.auction.aggregate({
    _count: true,
    where: {
      userId: req.authenticatedUserId || ""
    },
  })

  console.log("auctionsCount: ", auctionsCount);

  res.status(200).json({ auctionsCount: auctionsCount._count });
};

export default withMiddleware(
  "getOnly", "auth"
)(dashboard);
