import { Middleware } from "next-api-middleware";
import exp from "constants";
import { getServerSession } from "next-auth";
import { authOptions } from "@/pages/api/auth/[...nextauth]";
import { Setting } from "@prisma/client";
import prisma from "@/lib/prisma";
import logger from "@/lib/logger";

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
  try {
    const settings = await getSettings(userId);
    if (settings.status === false) {
      const statusCode = 204;
      logger.info(
        { userId, statusCode },
        "Aborting request as user setting is off"
      );
      res.status(204).end();
      return;
    } else {
      req.settings = settings;
      await next();
    }
  } catch (err) {
    const statusCode = 204;
    logger.error(
      { userId, statusCode, err },
      "ending response as settings not found for user"
    );
    res.status(statusCode).end();
    return;
  }
};

export default statusCheckMiddleware;
