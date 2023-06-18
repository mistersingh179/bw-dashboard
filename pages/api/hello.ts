// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from "next";
import { sleep } from "@/middlewares/delayMiddleware";
import logger from "@/lib/logger";
import withMiddleware from "@/middlewares/withMiddleware";

async function handler(req: NextApiRequest, res: NextApiResponse) {
  res.setHeader("Content-Type", "text/html");
  logger.info({ reqId: req.reqId }, "staring hello");
  await sleep(0);
  logger.info({ reqId: req.reqId }, "finishing hello");
  res.status(200).send("hello to you too");
}

export default withMiddleware()(handler);
