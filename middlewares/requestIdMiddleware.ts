import { Middleware } from "next-api-middleware";
import { nanoid } from "nanoid";
import logger from "@/lib/logger";

const requestIdMiddleware: Middleware = async (req, res, next) => {
  req.reqId = nanoid(5);
  await next();
};

export default requestIdMiddleware;
