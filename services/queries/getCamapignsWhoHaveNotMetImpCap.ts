import { Campaign, Prisma } from "@prisma/client";
import prisma from "@/lib/prisma";
import { User } from ".prisma/client";
import logger from "@/lib/logger";

type CampaignWithJustId = Pick<User, "id">;

const myLogger = logger.child({ name: "getCampaignsWhoHaveNotMetImpCap" });

type GetCampaignsWhoHaveNotMetImpCap = (
  userId: string
) => Promise<CampaignWithJustId[]>;

const getCampaignsWhoHaveNotMetImpCap: GetCampaignsWhoHaveNotMetImpCap = async (
  userId
) => {
  myLogger.info({ userId }, "starting service");
  const sql = Prisma.sql`
      select c.id
      from "public"."Campaign" c
               left join "public"."ScoredCampaign" sc on sc."campaignId" = c.id
               left join "public"."Advertisement" ad on ad."scoredCampaignId" = sc.id
               left join "public"."Impression" imp on imp."advertisementId" = ad.id
      where c."userId" = ${userId}
      group by (c.id, c."impressionCap")
      having count(imp.id) < c."impressionCap";`;

  const ans = await prisma.$queryRaw<CampaignWithJustId[]>(sql);
  return ans;
};

export default getCampaignsWhoHaveNotMetImpCap;

if (require.main === module) {
  (async () => {
    const ans = await getCampaignsWhoHaveNotMetImpCap(
      "clhtwckif000098wp207rs2fg"
    );
    console.log("*** ans: ", ans);
  })();
}
