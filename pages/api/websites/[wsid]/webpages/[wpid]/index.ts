import { NextApiHandler, NextApiRequest, NextApiResponse } from "next";
import withMiddleware from "@/middlewares/withMiddleware";
import { QueryParams } from "@/types/QueryParams";
import prisma from "@/lib/prisma";
import superjson from "superjson";
import getWebpageWithAdSpotsAndAdsCount from "@/services/queries/getWebpageWithAdSpotsAndOtherCounts";

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
  const webpage = await getWebpageWithAdSpotsAndAdsCount(
    wpid,
    wsid,
    req.authenticatedUserId as string
  );
  res
    .setHeader("Content-Type", "application/json")
    .status(200)
    .send(superjson.stringify(webpage));
};

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

  res
    .setHeader("Content-Type", "application/json")
    .status(200)
    .send(superjson.stringify(webpage));
};

export default withMiddleware("getPutDeleteOnly", "auth")(webpage);
