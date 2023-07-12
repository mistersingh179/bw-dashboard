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
  const ws = await prisma.website.findFirstOrThrow({
    where: {
      id: "cljyf33m3001h981c0luk5pfj",
    },
    include: {
      user: {
        include: {
          setting: true,
        },
      },
    },
  });
  const job = await mediumQueue.add("downloadMostVisitedUrls", {website: ws, settings: ws.user.setting!});
  console.log("ran job: ", job.id);
})();

export {};
