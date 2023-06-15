// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiHandler, NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth";
import { authOptions } from "./auth/[...nextauth]";
import prisma from "@/lib/prisma";
import superjson from "superjson";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const session = await getServerSession(req, res, authOptions);
  if (!session) {
    res.status(403).send("sorry access denied");
  }
  const user = await prisma.user.findFirst({
    select: {
      email: true,
      accounts: true,
    },
  });
  res
    .setHeader("Content-Type", "application/json")
    .status(200)
    .send(superjson.stringify(user));
}
