import { NextApiHandler } from "next";
import withMiddleware from "@/middlewares/withMiddleware";
import superjson from "superjson";
import getCampaignsWithTheirImpressionCount from "@/services/queries/getCampaignsWithTheirImpressionCount";

const impressionCounts: NextApiHandler = async (req, res) => {
  const userId = req.authenticatedUserId as string;
  const campsWithImpCount = await getCampaignsWithTheirImpressionCount(userId);
  res
    .setHeader("Content-Type", "application/json")
    .status(200)
    .send(superjson.stringify(campsWithImpCount));
};

export default withMiddleware("getOnly", "auth")(impressionCounts);
