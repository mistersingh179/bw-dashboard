import { Middleware } from "next-api-middleware";
import logger from "@/lib/logger";
import { isArray, pick } from "lodash";
import newrelic from "newrelic";

const loggingMiddleware: Middleware = async (req, res, next) => {
  const beforeTime = Date.now();

  const reqItems = pick(req, ["method", "url", "query", "body"]);
  const trueClientIp = req.headers["true-client-ip"];
  const renderId = req.headers["Rndr-Id"];

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
    { ...reqItems, trueClientIp, renderId, reqId: req.reqId, txName },
    "API Request"
  );

  if(req.reqId){
    res.setHeader("X-reqId", req.reqId);
  }

  await next();

  const responseTime = Date.now() - beforeTime;
  const resItems = pick(res, ["statusCode", "statusMessage"]);
  logger.info(
    {
      ...reqItems,
      trueClientIp,
      ...resItems,
      renderId,
      reqId: req.reqId,
      responseTime,
      txName,
    },
    "API Response"
  );
};

export default loggingMiddleware;
