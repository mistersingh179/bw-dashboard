import { Campaign, Prisma } from "@prisma/client";
import prisma from "@/lib/prisma";
import { User } from ".prisma/client";

type CampaignWithJustId = Pick<User, "id">;

type GetCampaignsWhoHaveNotMetImpCap = (
  userId: string
) => Promise<CampaignWithJustId[]>;

const getCampaignsWhoHaveNotMetImpCap: GetCampaignsWhoHaveNotMetImpCap = async (
  userId
) => {
  console.log("inside service: getCampaignsWhoHaveNotMetImpCap");
  const sql = Prisma.sql`\
select c.id  \
from "public"."Campaign" c \
inner join "public"."ScoredCampaign" sc on sc."campaignId" = c.id \
inner join "public"."Advertisement" ad on ad."scoredCampaignId" = sc.id \
left join "public"."Impression" imp on imp."advertisementId" = ad.id \
where c."userId" = ${userId} \
group by c.id \
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
