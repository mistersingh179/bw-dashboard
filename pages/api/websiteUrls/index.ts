import { NextApiHandler, NextApiRequest, NextApiResponse } from "next";
import prisma from "@/lib/prisma";
import { Campaign } from "@prisma/client";
import { formatISO, parseISO } from "date-fns";
import withMiddleware from "@/middlewares/withMiddleware";

const websiteUrlsHandler: NextApiHandler = async (req, res) => {
  switch (req.method) {
    case "GET":
      await handleListWebsiteUrls(req, res);
      break;
    case "POST":
      await handleCreateWebsiteUrl(req, res);
      break;
  }
};

const handleListWebsiteUrls = async (
  req: NextApiRequest,
  res: NextApiResponse
) => {
  const websiteUrls = await prisma.websiteUrl.findMany({
    where: {
      userId: req.authenticatedUserId,
    },
    orderBy: {
      id: "asc"
    }
  });
  console.log("websiteUrls: ", websiteUrls);
  res.json(websiteUrls);
};

const handleCreateWebsiteUrl = async (
  req: NextApiRequest,
  res: NextApiResponse
) => {
  const websiteUrl = await prisma.websiteUrl.create({
    data: {
      ...req.body,
      userId: req.authenticatedUserId,
    },
  });
  res.json(websiteUrl);
};

export default withMiddleware("getPostOnly", "auth")(websiteUrlsHandler);
