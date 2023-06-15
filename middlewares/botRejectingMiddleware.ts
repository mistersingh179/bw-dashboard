import {Middleware} from "next-api-middleware";
import isbot from "isbot";
import logger from "@/lib/logger";

const botRejectingMiddleware: Middleware = async (req, res, next) => {
  const userAgent = req.headers["user-agent"];
  if(userAgent && !isbot(userAgent)){
    await next();
  }else{
    const statusCode = 403;
    logger.info({statusCode, userAgent}, "stopping request as bot detected")
    res.status(statusCode).end();
  }
};

export default botRejectingMiddleware