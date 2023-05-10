import { NextApiHandler, NextApiRequest, NextApiResponse } from "next";
import prisma from "@/lib/prisma";
import { Campaign } from "@prisma/client";
import { formatISO, parseISO } from "date-fns";
import withMiddleware from "@/middlewares/withMiddleware";
import superjson from "superjson";

const websitesHandler: NextApiHandler = async (req, res) => {
  switch (req.method) {
    case "GET":
      await handleListWebsites(req, res);
      break;
    case "POST":
      await handleCreateWebsite(req, res);
      break;
  }
};

const handleListWebsites = async (
  req: NextApiRequest,
  res: NextApiResponse
) => {
  const websites = await prisma.website.findMany({
    where: {
      userId: req.authenticatedUserId,
    },
    orderBy: {
      id: "asc"
    }
  });
  console.log("websites: ", websites);
  res
    .setHeader("Content-Type", "application/json")
    .status(200)
    .send(superjson.stringify(websites));
};

const handleCreateWebsite = async (
  req: NextApiRequest,
  res: NextApiResponse
) => {
  const website = await prisma.website.create({
    data: {
      ...req.body,
      userId: req.authenticatedUserId,
    },
  });
  res
    .setHeader("Content-Type", "application/json")
    .status(200)
    .send(superjson.stringify(website));
};

export default withMiddleware("getPostOnly", "auth")(websitesHandler);
