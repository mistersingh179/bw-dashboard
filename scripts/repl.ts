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
import {
  DIVERSITY_CLASSIFIER,
  META_CONTENT_BUILD_FAIL_COUNT_LIMIT,
} from "@/constants";

prisma.$on("query", (e) => {
  const { timestamp, query, params, duration, target } = e;
  console.log(query);
  console.log({ timestamp, params, duration, target });
});

(async () => {
  const ans = await prisma.webpage.findFirst({
    orderBy: {
      createdAt: "desc"
    },
    take: 1
  })
  console.log("ans: ", ans);
  console.log(new Date(ans!.createdAt).toLocaleTimeString());
})();

export {};
