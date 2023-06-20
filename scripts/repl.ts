import getLogger from "../lib/logger";
import prisma from "@/lib/prisma";
import logger from "../lib/logger";
import { stripHtml } from "string-strip-html";
import createAdvertisementQueue, {
  queueEvents,
} from "@/jobs/queues/createAdvertisementQueue";

(async () => {
  const webpages = await prisma.webpage.findMany({
    where: {
      websiteId: "cliuhtdc4000v98ul85yvnzm5",
    },
    include: {
      _count: {
        select: {
          advertisementSpots: true
        }
      }
    }
  })
  console.log("webpages.length: ", webpages.length)
  console.log(webpages)
  const advertisementCount = await prisma.advertisement.count({
    where: {
      advertisementSpot: {
        webpage: {

        }
      }
    }
  })
})();

export {};
