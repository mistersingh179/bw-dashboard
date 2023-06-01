// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiHandler, NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth";
import prisma from "@/lib/prisma";
import superjson from "superjson";
import { authOptions } from "@/pages/api/auth/[...nextauth]";
import withMiddleware from "@/middlewares/withMiddleware";

const impersonate: NextApiHandler = async (req, res) => {
  const { userIdToImpersonate } = req.body;

  await prisma.user.findFirstOrThrow({
    where: {
      id: userIdToImpersonate ?? "",
    }
  })
  await prisma.session.updateMany({
    where: {
      userId: req.authenticatedUserId,
    },
    data: {
      userId: userIdToImpersonate,
    }
  })
  res
    .setHeader("Content-Type", "application/json")
    .status(204)
    .end();
};

export default withMiddleware("postOnly", "auth", "canManage")(impersonate);
