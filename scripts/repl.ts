import getLogger from "../lib/logger";
import prisma from "@/lib/prisma";
import logger from "../lib/logger";
import { stripHtml } from "string-strip-html";
import createAdvertisementQueue, {
  queueEvents,
} from "@/jobs/queues/createAdvertisementQueue";
import createCategories from "@/services/createCategories";

(async () => {
  const content = await prisma.content.findFirstOrThrow({
    where: {
      webpageId: "cljr7yveg005398cicqm09eij"
    }
  })
  console.log(content.desktopHtml);
})();

export {};
