import getLogger from "../lib/logger";
import prisma from "@/lib/prisma";
import logger from "../lib/logger";
import { stripHtml } from "string-strip-html";
import createAdvertisementQueue, {
  queueEvents,
} from "@/jobs/queues/createAdvertisementQueue";

(async () => {
  const foo = await prisma.content.findFirstOrThrow({
    where: {
      webpageId: "clj7p8hyf000098xf2r5saq46"
    }
  })
  console.log(foo.title === null);
  console.log(foo.title === undefined);
  console.log(foo.title === "");
  console.log(foo.title);
})();

export {};
