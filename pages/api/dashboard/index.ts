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

  const session = await getServerSession(req, res, authOptions);
  if(!session?.user){
    res.status(403).end();
    return;
  }

  const auctionsCount = await prisma.auction.aggregate({
    _count: true,
    where: {
      userId: session.user.id
    },
  })

  console.log("auctionsCount: ", auctionsCount);

  res.status(200).json({ auctionsCount: auctionsCount._count });
};

const allowedMethodMiddleware: Middleware = allowedMethodMiddlewareFactory([
  "GET",
]);

export default withMiddleware(
  allowedMethodMiddleware
)(dashboard);
