import { NextApiHandler } from "next";
import withMiddleware from "@/middlewares/withMiddleware";
import {QueryParams} from "@/types/QueryParams";
import prisma from "@/lib/prisma";
import superjson from "superjson";
import {omit, pick} from "lodash";
import {Prisma} from ".prisma/client";
import CategoryUncheckedUpdateInput = Prisma.CategoryUncheckedUpdateInput;
import getScalarFieldsOfModel from "@/lib/getScalarFieldsOfModel";

const categoriesHandler: NextApiHandler = async (req, res) => {
  switch (req.method) {
    case "PUT":
      await handleUpdateCategory(req, res);
    default:
      res.status(405).end();
  }
};

const handleUpdateCategory: NextApiHandler = async (req, res) => {
  const { catId } = req.query as QueryParams;
  const notAllowedAttributes = ["userId"];
  const allowedAttributes = getScalarFieldsOfModel("Category");
  let data = pick<CategoryUncheckedUpdateInput>(req.body, allowedAttributes);
  data = omit<CategoryUncheckedUpdateInput>(data, notAllowedAttributes);
  const category = await prisma.category.update({
    where: {
      id: catId,
      userId: req.authenticatedUserId,
    },
    data
  })
  res
    .setHeader("Content-Type", "application/json")
    .status(200)
    .send(superjson.stringify(category));
};

export default withMiddleware("getPutDeleteOnly", "auth")(categoriesHandler);
