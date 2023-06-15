import { Middleware } from "next-api-middleware";
import { nanoid } from "nanoid";
import logger from "@/lib/logger";

const requestIdMiddleware: Middleware = async (req, res, next) => {
  const requestId = nanoid(5);
  logger.info({ requestId }, "setting up request Id");
  req.requestId = requestId;
  await next();
};

export default requestIdMiddleware;
