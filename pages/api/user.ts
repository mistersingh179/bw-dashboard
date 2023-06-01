// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiHandler, NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth";
import { authOptions } from "./auth/[...nextauth]";
import prisma from "@/lib/prisma";
import superjson from "superjson";
import withMiddleware from "@/middlewares/withMiddleware";

const user: NextApiHandler = async (req, res) => {

  const user = await prisma.user.findFirst({
    where: {
      id: req.authenticatedUserId
    }
  });

  res
    .setHeader("Content-Type", "application/json")
    .status(200)
    .send(superjson.stringify(user));
};

export default withMiddleware("getOnly", "auth")(user);