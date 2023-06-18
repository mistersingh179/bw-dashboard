import { NextApiHandler, NextApiRequest, NextApiResponse } from "next";
import prisma from "@/lib/prisma";
import withMiddleware from "@/middlewares/withMiddleware";
import { QueryParams } from "@/types/QueryParams";
import superjson from "superjson";
import { Webpage } from ".prisma/client";
import processWebpageQueue from "@/jobs/queues/processWebpageQueue";
import logger from "@/lib/logger";

const webpagesHandler: NextApiHandler = async (req, res) => {
  switch (req.method) {
    case "GET":
      await handleListWebpages(req, res);
      break;
    case "POST":
      await handleCreateWebpage(req, res);
      break;
  }
};

const handleListWebpages = async (
  req: NextApiRequest,
  res: NextApiResponse
) => {
  const { wsid, page = 1, pageSize = 10 } = req.query as QueryParams;
  const skip = (Number(page) - 1) * Number(pageSize);
  const take = Number(pageSize);

  const webpages = await prisma.webpage.findMany({
    where: {
      website: {
        id: wsid,
        user: {
          id: req.authenticatedUserId,
        },
      },
    },
    orderBy: {
      createdAt: "asc",
    },
    take,
    skip,
  });
  res
    .setHeader("Content-Type", "application/json")
    .status(200)
    .send(superjson.stringify(webpages));
};

const handleCreateWebpage = async (
  req: NextApiRequest,
  res: NextApiResponse
) => {
  const { wsid } = req.query as QueryParams;

  if (req.body["url"]?.endsWith("/")) {
    req.body["url"] = req.body["url"].slice(0, -1);
  }

  const webpage: Webpage = await prisma.webpage.create({
    data: {
      ...req.body,
      website: {
        connect: {
          id: wsid,
          user: {
            id: req.authenticatedUserId,
          },
        },
      },
    },
  });

  const job = await processWebpageQueue.add("processWebpage", { webpage });
  logger.info({ webpage, id: job.id, reqId: req.reqId }, "scheduled job to process webpage");

  res
    .setHeader("Content-Type", "application/json")
    .status(200)
    .send(superjson.stringify(webpage));
};

export default withMiddleware("getPostOnly", "auth")(webpagesHandler);
