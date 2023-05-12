import {NextApiHandler, NextApiRequest, NextApiResponse} from "next";
import withMiddleware from "@/middlewares/withMiddleware";
import {QueryParams} from "@/types/QueryParams";
import getAdvertisementsForWebpage from "@/services/queries/getAdvertisementsForWebpage";
import superjson from "superjson";
import prisma from "@/lib/prisma";

const categoriesOfWebpageHandler: NextApiHandler = async (req, res) => {
  switch (req.method) {
    case "GET":
      await handleListCategories(req, res);
      break;
  }
};

const handleListCategories = async (req: NextApiRequest, res: NextApiResponse) => {
  const { wpid, wsid } = req.query as QueryParams;
  const userId = req.authenticatedUserId as string;
  const categories = await prisma.category.findMany({
    where: {
      webpages: {
        some: {
          id: wpid,
          website: {
            id: wsid,
            user: {
              id: userId
            }
          }
        }
      }
    }
  })
  res
    .setHeader("Content-Type", "application/json")
    .status(200)
    .send(superjson.stringify(categories));
}


export default withMiddleware("getOnly", "auth")(categoriesOfWebpageHandler);
