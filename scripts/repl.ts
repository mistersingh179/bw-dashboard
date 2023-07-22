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
  const ans = await prisma.webpage.findFirstOrThrow({
    include: {
      content: {
        select: {
          title: true,
          description: true,
          id: true
        }
      }
    }
  });
  console.log(ans);

})();

export {};
