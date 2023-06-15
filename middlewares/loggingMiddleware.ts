import { NextApiRequest, NextApiResponse } from "next";
import { Middleware } from "next-api-middleware";
import { nanoid } from "nanoid";
import logger from "@/lib/logger";
import { pick } from "lodash";

const loggingMiddleware: Middleware = async (req, res, next) => {
  const reqItems = pick(req, ["method", "url", "query", "body"]);
  logger.info(reqItems, "API Request");
  await next();
  const resItems = pick(res, ["statusCode", "statusMessage"]);
  logger.info(resItems, "API Response");
};

export default loggingMiddleware;
