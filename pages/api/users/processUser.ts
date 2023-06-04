// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiHandler, NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth";
import prisma from "@/lib/prisma";
import { Setting } from "@prisma/client";
import superjson from "superjson";
import { authOptions } from "@/pages/api/auth/[...nextauth]";
import withMiddleware from "@/middlewares/withMiddleware";
import processUserJob from "@/defer/processUserJob";

const processUser: NextApiHandler = async (req, res) => {
  const { userIdToProcess } = req.body;

  const user = await prisma.user.findFirstOrThrow({
    where: {
      id: userIdToProcess ?? "",
      setting: {
        isNot: null
      }
    },
    include: {
      setting: true,
    }
  })

  const job = await processUserJob(user, user.setting!);

  res
    .setHeader("Content-Type", "application/json")
    .status(202)
    .send(superjson.stringify(job));
};

export default withMiddleware("postOnly", "auth", "canManage")(processUser);
