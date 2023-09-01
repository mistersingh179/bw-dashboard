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
  console.log("hello");
  const result = await prisma.metaContentSpot.findMany({
    where: {
      webpageId: "clkrey0jx000m985gb765ieg0"
    }
  });
  console.log(result);
})();

export {};
