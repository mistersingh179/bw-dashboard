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
import { subMonths } from "date-fns";
import processWebpageQueue from "@/jobs/queues/processWebpageQueue";
import MediumQueue from "@/jobs/queues/mediumQueue";
import mediumQueue, {
  queueEvents as MediumQueueEvent,
} from "@/jobs/queues/mediumQueue";

(async () => {
  console.log("***");
  const metaContentSpot = await prisma.metaContentSpot.findFirstOrThrow({
    where: {
      id: "clm6otiri000198t4ikvnaj0c"
    }
  })
  const jobResult = await mediumQueue.add("createMetaContents", metaContentSpot);
  const ans = await jobResult.waitUntilFinished(MediumQueueEvent)
  console.log("ans: ", ans)


})();

export {};
