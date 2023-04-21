import { Middleware } from "next-api-middleware";
import {nanoid} from "nanoid";

const requestIdMiddleware: Middleware = async (req, res, next) => {
  const requestId = nanoid(5);
  console.log("in requestIdMiddleware: ", requestId);
  req.requestId = requestId;
  await next();
};

export default requestIdMiddleware;
