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
    const renderId = req.headers["Rndr-Id"] || "unknown";
    const reqId = req.reqId || "unknown";
    logger.info({renderId, reqId}), "before making call to getting settings";
    const settings = await getSettings(userId);
    logger.info({renderId, reqId}), "after making call to getting settings";
    const bypassedUrls = [
      "most-affectionate-dogs",
      "best-sweet-perfumes",
      "lorem-lipsum.html",
      "study.html",
    ];
    const thisIsBypassedUrl = bypassedUrls.find(
      (url) => req.body?.url?.indexOf(url) >= 0
    );
    if (thisIsBypassedUrl) {
      logger.info(
        { url: req.body.url },
        "overriding status check as this is special url"
      );
      req.settings = settings;
      req.settings.status = true;
      await next();
    } else if (settings.status === false) {
      logger.info(
        { url: req.body.url },
        "no override on status check as this is NOT special url"
      );
      const statusCode = 200;
      const message = "Aborting request as user setting is off";
      logger.info({ userId, statusCode, reqId: req.reqId }, message);
      res.status(statusCode).send(message);
      return;
    } else {
      req.settings = settings;
      await next();
    }
  } catch (err) {
    const statusCode = 200;
    const message = "Aborting request as settings not found for user";
    logger.error({ userId, statusCode, err, reqId: req.reqId }, message);
    res.status(statusCode).send(message);
    return;
  }
};

export default statusCheckMiddleware;
