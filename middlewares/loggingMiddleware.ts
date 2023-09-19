import { Middleware } from "next-api-middleware";
import logger from "@/lib/logger";
import { isArray, pick } from "lodash";
import newrelic from "newrelic";

const loggingMiddleware: Middleware = async (req, res, next) => {
  const beforeTime = Date.now();

  const reqItems = pick(req, ["method", "url", "query", "body"]);
  const trueClientIp = req.headers["true-client-ip"];

  let txName = req.url;
  if (txName && req.query) {
    for (let [key, value] of Object.entries(req.query)) {
      if (isArray(value)) {
        value = value[0];
      }
      if (value) {
        txName = txName.replace(value, key);
      }
    }
    newrelic.setTransactionName(txName);
  }

  logger.info(
    { ...reqItems, trueClientIp, reqId: req.reqId, txName },
    "API Request"
  );

  await next();

  const responseTime = Date.now() - beforeTime;
  const resItems = pick(res, ["statusCode", "statusMessage"]);
  logger.info(
    { ...reqItems, ...resItems, reqId: req.reqId, responseTime, txName },
    "API Response"
  );
};

export default loggingMiddleware;
