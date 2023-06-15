import { NextApiHandler, NextApiRequest, NextApiResponse } from "next";
import prisma from "@/lib/prisma";
import { Campaign } from "@prisma/client";
import { formatISO, parseISO } from "date-fns";
import withMiddleware from "@/middlewares/withMiddleware";
import superjson from "superjson";
import {Category} from ".prisma/client";

const categoriesHandler: NextApiHandler = async (req, res) => {
  switch (req.method) {
    case "GET":
      await handleListCategories(req, res);
      break;
  }
};

export type CategoryWithCounts = Category & {_count: {campaigns: number, webpages: number}}


const handleListCategories = async (
  req: NextApiRequest,
  res: NextApiResponse
) => {
  const categories: CategoryWithCounts[] = await prisma.category.findMany({
    where: {
      userId: req.authenticatedUserId,
    },
    include: {
      _count: {
        select: {
          webpages: true,
          campaigns: true,
        }
      }
    }
  });
  res
    .setHeader("Content-Type", "application/json")
    .status(200)
    .send(superjson.stringify(categories));
};

export default withMiddleware("getOnly", "auth")(categoriesHandler);
