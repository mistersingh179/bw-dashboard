import { Middleware } from "next-api-middleware";
import exp from "constants";
import { getServerSession } from "next-auth";
import { authOptions } from "@/pages/api/auth/[...nextauth]";
import {Setting} from "@prisma/client";
import prisma from "@/lib/prisma";

export const getSettings = async (userId: string): Promise<Setting> => {
  const settings = await prisma.setting.findFirstOrThrow({
    where: {
      userId: userId,
    },
  });
  return settings;
};

const statusCheckMiddleware: Middleware = async (req, res, next) => {
  const { userId } = req.body;

  const settings = await getSettings(userId);
  if (settings.status === false) {
    console.log("Aborting as user setting status is off.");
    res.status(204).end();
    return;
  } else {
    req.settings = settings;
    await next();
  }
};

export default statusCheckMiddleware;
