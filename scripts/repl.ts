import getLogger from "../lib/logger";
import prisma from "@/lib/prisma";
import logger from "../lib/logger";
import { stripHtml } from "string-strip-html";
import createAdvertisementQueue, {
  queueEvents,
} from "@/jobs/queues/createAdvertisementQueue";
import createCategories from "@/services/createCategories";
import {startOfDay} from "date-fns";
import mediumQueue from "@/jobs/queues/mediumQueue";
import mediumWorker from "@/jobs/workers/mediumWorker";

(async () => {
  console.log("hello");
  logger.info({}, "foo bar");
})();

export {};
