import {Prisma, Webpage} from "@prisma/client";

import logger from "@/lib/logger";
import prisma from "@/lib/prisma";
import {User} from ".prisma/client";

const myLogger = logger.child({ name: "getWebpagesWithZeroAds" });

type GetWebpagesWithZeroAds = (websiteId: string) => Webpage[];

const getWebpagesWithZeroAds = async (websiteId: string) => {
  myLogger.info({ websiteId }, "started service");
  const sql = Prisma.sql`\
with foo as ( \
select "Webpage".id as wpid, "AdvertisementSpot".id as asid, count("Advertisement".id) as adcount \
from "Webpage" \
inner join "Website" on "Webpage"."websiteId" = "Website".id \
left join "AdvertisementSpot" on "AdvertisementSpot"."webpageId" = "Webpage".id \ 
left join "Advertisement" on "Advertisement"."advertisementSpotId" = "AdvertisementSpot".id \
where "Website".id = ${websiteId} \
group by ("Webpage".id, "AdvertisementSpot".id) \
), \
bar as ( \
select distinct wpid from foo where adcount=0 \
) \
select "Webpage".* from bar \ 
inner join "Webpage" on "Webpage".id = bar.wpid; \ 
`;
  const ans = await prisma.$queryRaw<Webpage[]>(sql);
  return ans;
};

export default getWebpagesWithZeroAds;

if (require.main === module) {
  (async () => {
    const ans = await getWebpagesWithZeroAds("cliuhtdc4000v98ul85yvnzm5");
    myLogger.info({}, "*** ans: " + ans.length);
  })();
}
