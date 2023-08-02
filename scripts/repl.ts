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
import processWebpageQueue from "@/jobs/queues/processWebpageQueue";
(async () => {
  const myLogger = logger.child({ name: "foo" });
  const webpages = await prisma.webpage.findMany({
    where: {
      website: {
        userId: 'clijanfjj000cmn08e2vlk52j'
      },
    },
  });
  for (const wp of webpages) {
    const job = await processWebpageQueue.add("processWebpage", {
      webpage: wp,
    });
    myLogger.info({id: job.id, url: wp.url}, "scheduled job to process webpage")
  }
})();

export {};
