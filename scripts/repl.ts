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
(async () => {
  const sql = Prisma.sql`
      select count(*) as "impressionsCount"
      from "Impression" 
      inner join "Auction" A on A.id = "Impression"."auctionId"`;

  const ans = await prisma.$queryRaw(sql);
  console.log(ans);

})();

export {};
