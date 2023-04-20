import { NextApiRequest, NextApiResponse } from "next";
import { Middleware } from "next-api-middleware";
import {nanoid} from "nanoid";

const loggingMiddleware: Middleware = async (req, res, next) => {
  console.log("API Request: ", req.method, req.url, req.query, req.body);
  await next();
  console.log(res.statusCode, "API Response");
};

export default loggingMiddleware;
