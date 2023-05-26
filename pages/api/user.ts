// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiHandler, NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth";
import { authOptions } from "./auth/[...nextauth]";
import prisma from "@/lib/prisma";
import superjson from "superjson";
import helloWorld from "@/defer/hello-world";

const handler: NextApiHandler = async (req, res) => {
  const session = await getServerSession(req, res, authOptions);
  if (!session) {
    res.status(403).send("sorry access denied");
  }

  const user = await prisma.user.findFirst();

  const jobId = await helloWorld(user?.name ?? "unknown");

  res
    .setHeader("Content-Type", "application/json")
    .status(200)
    .send(superjson.stringify({ user, jobId }));
};

export default handler;
