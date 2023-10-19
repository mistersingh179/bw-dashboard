// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiHandler, NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth";
import prisma from "@/lib/prisma";
import superjson from "superjson";
import {authOptions} from "@/pages/api/auth/[...nextauth]";
import withMiddleware from "@/middlewares/withMiddleware";

const users: NextApiHandler = async (req, res) => {
  switch (req.method) {
    case "GET":
      await handleListUsers(req, res);
      break;
  }
};

const handleListUsers: NextApiHandler = async (req, res) => {
  const users = await prisma.user.findMany({
    include: {
      setting: true,
      websites: true,
      _count: {
        select: {
          websites: true,
          categories: true,
          campaigns: true,
        }
      }
    }
  });

  res
    .setHeader("Content-Type", "application/json")
    .status(200)
    .send(superjson.stringify(users));
}

export default withMiddleware("getOnly", "auth", "canManage")(users);