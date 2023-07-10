import getLogger from "../lib/logger";
import prisma from "@/lib/prisma";
import logger from "../lib/logger";
import { stripHtml } from "string-strip-html";
import createAdvertisementQueue, {
  queueEvents,
} from "@/jobs/queues/createAdvertisementQueue";
import createCategories from "@/services/createCategories";
import {startOfDay} from "date-fns";

const today = new Date()
const startOfToday = startOfDay(today);

(async () => {
  const result = await prisma.auction.groupBy({
    by: ["url"],
    where: {
      userId: "clijnsj8p01pskz08xjo9cq4g",
      createdAt: {
        gte: undefined
      }
    },
    _count: {
      id: true
    },
    orderBy: {
      _count: {
        id: 'desc'
      }
    },
    take: 10
  });
  console.log(result);

})();

export {};
