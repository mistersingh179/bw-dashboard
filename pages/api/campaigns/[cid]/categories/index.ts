import { NextApiHandler, NextApiRequest, NextApiResponse } from "next";
import prisma from "@/lib/prisma";
import { formatISO, parseISO } from "date-fns";
import withMiddleware from "@/middlewares/withMiddleware";
import { QueryParams } from "@/types/QueryParams";
import superjson from "superjson";
import { Category, Prisma } from ".prisma/client";
import CategoryWhereUniqueInput = Prisma.CategoryWhereUniqueInput;

const categoriesHandler: NextApiHandler = async (req, res) => {
  switch (req.method) {
    case "GET":
      await handleListCategories(req, res);
      break;
    case "POST":
      await handleSetCategories(req, res);
      break;
  }
};

const handleListCategories = async (
  req: NextApiRequest,
  res: NextApiResponse
) => {
  const { cid } = req.query as QueryParams;

  const categories = await prisma.category.findMany({
    where: {
      campaigns: {
        some: {
          id: cid,
          user: {
            id: req.authenticatedUserId,
          },
        },
      },
      userId: req.authenticatedUserId,
    },
  });
  res
    .setHeader("Content-Type", "application/json")
    .status(200)
    .send(superjson.stringify(categories));
};

const handleSetCategories = async (
  req: NextApiRequest,
  res: NextApiResponse
) => {
  const { cid } = req.query as QueryParams;
  const categoriesInput: CategoryWhereUniqueInput[] = req.body.categories.map(
    (c: string) => ({ id: c })
  );
  const campaign = await prisma.campaign.update({
    where: {
      id: cid,
    },
    data: {
      categories: {
        set: categoriesInput,
      },
    },
    include: {
      categories: true,
    },
  });
  res
    .setHeader("Content-Type", "application/json")
    .status(200)
    .send(superjson.stringify(campaign.categories));
};

export default withMiddleware("getPostOnly", "auth")(categoriesHandler);
