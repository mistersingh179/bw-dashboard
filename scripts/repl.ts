import prisma from "@/lib/prisma";
import { Prisma, Setting } from "@prisma/client";
import { subHours } from "date-fns";
import { User } from ".prisma/client";

/*
if impressions table has campaignId:
  I can left join campaign with impressions, and then group on campaigns & get count of impressions
  I can then further filter the count using a `having`
so i only get campaigns which have less impressions than their cap
 */

(async () => {
  const userId: string = "clhtwckif000098wp207rs2fg";

  const sql = Prisma.sql`\
select c.id, c.name, count(imp.id) as "ic" \
from "public"."Campaign" c \
inner join "public"."ScoredCampaign" sc on sc."campaignId" = c.id \
inner join "public"."Advertisement" ad on ad."scoredCampaignId" = sc.id \
left join "public"."Impression" imp on imp."advertisementId" = ad.id \
where \
 c."userId" = ${userId} and \
 c.status = true and \
 c.start < now() and \
 c.end > now() \
group by (c.id, c.name) \
having count(imp.id) < c."impressionCap";`

  console.log("sql: ", sql);

  const ans = await prisma.$queryRaw<(User & {ic: number})[] >(sql);
  console.log(ans);
  console.log("*** ans: ", ans[0].id, ans[0].name, Number(ans[0].ic));
})();

export {};
