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
import {DIVERSITY_CLASSIFIER, META_CONTENT_BUILD_FAIL_COUNT_LIMIT} from "@/constants";

prisma.$on("query", (e) => {
  const { timestamp, query, params, duration, target } = e;
  console.log(query);
  console.log({ timestamp, params, duration, target });
});

(async () => {
  console.log("***");
  const ans = await prisma.metaContentSpot.findMany({
    where: {
      webpageId: "clm9jvmq200jo980pksya3xcj",
      metaContents: {
        none: {
          diveristyClassifierResult: DIVERSITY_CLASSIFIER.DIVERSE
        }
      }
    },
    select: {
      id: true,
    },
    take: 1
  })
  console.log(ans)
  console.log("***");
})();

export {};
