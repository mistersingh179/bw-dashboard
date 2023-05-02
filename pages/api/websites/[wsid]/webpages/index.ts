import { NextApiHandler, NextApiRequest, NextApiResponse } from "next";
import prisma from "@/lib/prisma";
import { Campaign } from "@prisma/client";
import { formatISO, parseISO } from "date-fns";
import withMiddleware from "@/middlewares/withMiddleware";
import {QueryParams} from "@/types/QueryParams";

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
  const { wsid } = req.query as QueryParams;
  const webpages = await prisma.webpage.findMany(
    {
      where: {
        website: {
          id: wsid,
          user: {
            id: req.authenticatedUserId
          }
        }
      }
    }
  );
  console.log("webpages: ", webpages);
  res.json(webpages);
};

const handleCreateWebpage = async (
  req: NextApiRequest,
  res: NextApiResponse
) => {
  const { wsid } = req.query as QueryParams;
  const webpage = await prisma.webpage.create({
    data: {
      ...req.body,
      website: {
        connect: {
          id: wsid,
          user: {
            id: req.authenticatedUserId
          }
        }
      }
    },
  });
  res.json(webpage);
};

export default withMiddleware("getPostOnly", "auth")(webpagesHandler);
