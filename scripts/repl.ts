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
  const options = ["a", "b"];
  const random = Math.random();
  console.log(random);
  const ratePercentage = 80;
  console.log(ratePercentage / 100)
  ratePercentage
  if(random < ratePercentage / 100){
    console.log('b')
  }else{
    console.log('a')
  }
  console.log("***");
})();

export {};
