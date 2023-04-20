import { NextApiRequest, NextApiResponse } from "next";
import { Middleware } from "next-api-middleware";

const customHeadersMiddleware: Middleware = async (req, res, next) => {
  res.setHeader("x-powered-by", "brandweaver.ai");
  await next();
};

export default customHeadersMiddleware;
