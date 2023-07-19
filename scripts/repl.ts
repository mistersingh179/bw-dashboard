import getLogger from "../lib/logger";
import prisma from "@/lib/prisma";
import logger from "../lib/logger";
import { stripHtml } from "string-strip-html";
import createAdvertisementQueue, {
  queueEvents,
} from "@/jobs/queues/createAdvertisementQueue";
import getCampaignsWhoHaveNotMetImpCap from "@/services/queries/getCamapignsWhoHaveNotMetImpCap";
import redisClient from "@/lib/redisClient";

(async () => {
  const t1 = performance.now();
  const ans = await prisma.user.findFirst({
    where: {
      id: 'clgf6zqrb000098o4yf9pd6hp'
    }
  });
  console.log("it took: ", performance.now() - t1);

})();

export {};
