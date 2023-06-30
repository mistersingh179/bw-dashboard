import {Prisma, Webpage} from "@prisma/client";

import logger from "@/lib/logger";
import prisma from "@/lib/prisma";
import {User} from ".prisma/client";

const myLogger = logger.child({name: "getWebpagesWithZeroAds"});

type GetWebpagesWithZeroAds = (websiteId: string) => Webpage[];

const getWebpagesWithZeroAds = async (websiteId: string) => {
  myLogger.info({websiteId}, "starting service");
  const sql = Prisma.sql`\
with wp_ads_count as (
  select wp.id, count(a.id)
  from "Website" ws
    inner join "Webpage" wp on ws.id = wp."websiteId" and ws.id = ${websiteId}
    left join "AdvertisementSpot" adsp on wp.id = adsp."webpageId"
    left join "Advertisement" a on adsp.id = a."advertisementSpotId"
  group by wp.id
)
select w.*
from wp_ads_count
  inner join "Webpage" w on w.id = wp_ads_count.id
where wp_ads_count.count = 0;
`;
  const ans = await prisma.$queryRaw<Webpage[]>(sql);
  return ans;
};

export default getWebpagesWithZeroAds;

if (require.main === module) {
  (async () => {
    const ans = await getWebpagesWithZeroAds("clini999t00jhm708ficnmto0");
    console.log("*** ans: ", ans);
  })();
}
