import {NextApiHandler, NextApiRequest, NextApiResponse} from "next";
import withMiddleware from "@/middlewares/withMiddleware";
import {QueryParams} from "@/types/QueryParams";
import getAdvertisementsForWebpage from "@/services/queries/getAdvertisementsForWebpage";
import superjson from "superjson";

const advertismentsWithDetailHandler: NextApiHandler = async (req, res) => {
  switch (req.method) {
    case "GET":
      await handleListAdvertisementsWithDetail(req, res);
      break;
  }
};

const handleListAdvertisementsWithDetail = async (req: NextApiRequest, res: NextApiResponse) => {
  const { wpid, wsid } = req.query as QueryParams;
  const userId = req.authenticatedUserId as string;
  const webpageWithDetail = await getAdvertisementsForWebpage(wsid, wpid, userId);
  res
    .setHeader("Content-Type", "application/json")
    .status(200)
    .send(superjson.stringify(webpageWithDetail));
}


export default withMiddleware("getOnly", "auth")(advertismentsWithDetailHandler);
