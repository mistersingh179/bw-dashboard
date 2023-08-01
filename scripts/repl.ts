import getLogger from "../lib/logger";
import prisma from "@/lib/prisma";
import logger from "../lib/logger";
import { stripHtml } from "string-strip-html";
import createAdvertisementQueue, {
  queueEvents,
} from "@/jobs/queues/createAdvertisementQueue";
import getCampaignsWhoHaveNotMetImpCap from "@/services/queries/getCamapignsWhoHaveNotMetImpCap";
import redisClient from "@/lib/redisClient";

import { User, Prisma } from "@prisma/client";
import {subMonths} from "date-fns";
(async () => {
  const userId = 'clijanfjj000cmn08e2vlk52j';
  const now = new Date();
  const monthAgo = subMonths(now, 1);
  const sql = Prisma.sql`
      select date("Auction"."createdAt"),
             count("Auction".id) as auctions,
             count(I.id)         as impressions,
             count(C.id)         as clicks
      from "Auction"
               left join "Impression" I on "Auction".id = I."auctionId"
               left join "Impression" C on "Auction".id = C."auctionId" and C.clicked = true
      where "userId" = ${userId}
        and "Auction"."createdAt" >= ${monthAgo}
        and "Auction"."createdAt" <= ${now}
      group by (date("Auction"."createdAt"))
      ;
  `;
  const ans = await prisma.$queryRaw(sql);
  console.log(ans);

})();

export {};
