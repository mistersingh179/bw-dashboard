import {NextApiHandler, NextApiRequest, NextApiResponse} from "next";
import withMiddleware from "@/middlewares/withMiddleware";
import {QueryParams} from "@/types/QueryParams";
import getAdvertisementsForWebpage from "@/services/queries/getAdvertisementsForWebpage";

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
  res.json(webpageWithDetail);
}


export default withMiddleware("getOnly", "auth")(advertismentsWithDetailHandler);
