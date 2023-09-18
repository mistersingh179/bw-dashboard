import { NextApiRequest, NextApiResponse } from "next";
import { Middleware } from "next-api-middleware";
import { nanoid } from "nanoid";
import logger from "@/lib/logger";
import { pick } from "lodash";
import newrelic from 'newrelic';

const loggingMiddleware: Middleware = async (req, res, next) => {
  const beforeTime = Date.now();

  const reqItems = pick(req, ["method", "url", "query", "body"]);
  const trueClientIp = req.headers["true-client-ip"];

  logger.info({ ...reqItems, trueClientIp, reqId: req.reqId }, "API Request");

  if(req.url){
    newrelic.setTransactionName(req.url);
  }

  await next();

  const responseTime = Date.now() - beforeTime;
  const resItems = pick(res, ["statusCode", "statusMessage"]);
  logger.info(
    { ...reqItems, ...resItems, reqId: req.reqId, responseTime },
    "API Response"
  );
};

export default loggingMiddleware;
