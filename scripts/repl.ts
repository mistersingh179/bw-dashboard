import getLogger from "../lib/logger";
import prisma from "@/lib/prisma";
import logger from "../lib/logger";
import { stripHtml } from "string-strip-html";
import createAdvertisementQueue, {
  queueEvents,
} from "@/jobs/queues/createAdvertisementQueue";
import getCampaignsWhoHaveNotMetImpCap from "@/services/queries/getCamapignsWhoHaveNotMetImpCap";
import redisClient from "@/lib/redisClient";
import { Prisma } from "@prisma/client";

(async () => {
  await prisma.scoredCampaign.updateMany({
    where: {
      id: undefined,
      isBest: false,
    },
    data: {
      isBest: true,
    },
  });

  await prisma.scoredCampaign.updateMany({
    where: {
      webpageId: undefined,
      isBest: true,
      id: {
        not: undefined
      },
    },
    data: {
      isBest: false,
    },
  });
})();

export {};
