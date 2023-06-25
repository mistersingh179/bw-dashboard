import getLogger from "../lib/logger";
import prisma from "@/lib/prisma";
import logger from "../lib/logger";
import { stripHtml } from "string-strip-html";
import createAdvertisementQueue, {
  queueEvents,
} from "@/jobs/queues/createAdvertisementQueue";

(async () => {
  const contentExists = await prisma.content.count({
    where: {
      title: {
        not: {
          equals: ""
        }
      },
      description: {
        not: {
          equals: ""
        }
      }
    }
  })

})();

export {};
