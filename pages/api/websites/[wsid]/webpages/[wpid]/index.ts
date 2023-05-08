import { NextApiHandler, NextApiRequest, NextApiResponse } from "next";
import withMiddleware from "@/middlewares/withMiddleware";
import { QueryParams } from "@/types/QueryParams";
import prisma from "@/lib/prisma";
import getWebpageDetail from "@/services/queries/getWebpageDetail";

const webpage: NextApiHandler = async (req, res) => {
  switch (req.method) {
    case "GET":
      await handleShowWebpage(req, res);
      break;
    case "PUT":
      await handleUpdateWebpage(req, res);
      break;
  }
};

const handleShowWebpage = async (req: NextApiRequest, res: NextApiResponse) => {
  const { wpid, wsid } = req.query as QueryParams;
  const webpageWithDetail = await getWebpageDetail(wpid as string);
  res.json(webpageWithDetail);
}

const handleUpdateWebpage = async (
  req: NextApiRequest,
  res: NextApiResponse
) => {
  const { wpid, wsid } = req.query as QueryParams;
  const webpage = await prisma.webpage.update({
    where: {
      id: wpid,
      website: {
        id: wsid,
        user: {
          id: req.authenticatedUserId,
        },
      },
    },
    data: {
      ...req.body,
    },
  });
  console.log("updated webpage is: ", webpage);
  res.json(webpage);
};

export default withMiddleware("getPutDeleteOnly", "auth")(webpage);
