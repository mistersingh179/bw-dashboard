import { NextApiHandler } from "next";
import prisma from "@/lib/prisma";
import {getServerSession, User} from "next-auth";
import { authOptions } from "@/pages/api/auth/[...nextauth]";
import withMiddleware from "@/middlewares/my-middleware";
import {Middleware} from "next-api-middleware";
import allowedMethodMiddlewareFactory from "@/middlewares/allowedMethodMiddlewareFactory";

type DashboardResponseData = {
  auctionsCount: Number;
};

export const sleep = async (ms: number) =>{
  return new Promise((resolve, reject) => {
    setTimeout(resolve, ms);
  })
}

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

const allowedMethodMiddleware: Middleware = allowedMethodMiddlewareFactory([
  "GET",
]);

export default withMiddleware(
  allowedMethodMiddleware, "auth"
)(dashboard);
