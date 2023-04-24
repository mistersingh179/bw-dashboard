import { NextApiHandler, NextApiRequest, NextApiResponse } from "next";
import withMiddleware from "@/middlewares/withMiddleware";
import { QueryParams } from "@/types/QueryParams";
import prisma from "@/lib/prisma";

const websiteUrl: NextApiHandler = async (req, res) => {
  switch (req.method) {
    case "PUT":
      await handleWebsiteUrlUpdate(req, res);
      break;
  }
};

const handleWebsiteUrlUpdate = async (
  req: NextApiRequest,
  res: NextApiResponse
) => {
  const { wuid } = req.query as QueryParams;
  const websiteUrl = await prisma.websiteUrl.update({
    where: {
      id: wuid,
      userId: req.authenticatedUserId,
    },
    data: {
      ...req.body
    }
  });
  console.log("updated websiteUrl is: ", websiteUrl);
  res.json(websiteUrl);
};

export default withMiddleware("getPutDeleteOnly", "auth")(websiteUrl);
