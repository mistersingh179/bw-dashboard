import logger from "@/lib/logger";
import { Prisma } from "@prisma/client";
import prisma from "@/lib/prisma";

export type CampWithImpCount = { id: string; impressionsCount: number };

type GetCampaignsWithTheirImpressionCount = (
  userId: string
) => Promise<CampWithImpCount[]>;

const getCampaignsWithTheirImpressionCount: GetCampaignsWithTheirImpressionCount =
  async (userId) => {
    const myLogger = logger.child({
      name: "getCampaignsWithTheirImpressionCount",
      userId,
    });
    myLogger.info({}, "started service");
    const sql = Prisma.sql`
        select "Campaign".id, count(I.id) as "impressionsCount"
        from "Campaign"
                 LEFT join "ScoredCampaign" SC on "Campaign".id = SC."campaignId"
                 LEFT join "Advertisement" A on SC.id = A."scoredCampaignId"
                 LEFT join "Impression" I on A.id = I."advertisementId"
        where "userId" = ${userId}
        group by "Campaign".id;
    `;
    const result = await prisma.$queryRaw<CampWithImpCount[]>(sql);
    myLogger.info({result}, "finished service");
    return result;
  };

export default getCampaignsWithTheirImpressionCount;

if (require.main === module) {
  (async () => {
    await getCampaignsWithTheirImpressionCount("clhtwckif000098wp207rs2fg");
  })();
}
