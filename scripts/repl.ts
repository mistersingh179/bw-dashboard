import getLogger from "../lib/logger";
import prisma from "@/lib/prisma";
import logger from "../lib/logger";
import { stripHtml } from "string-strip-html";
import createAdvertisementQueue, {
  queueEvents,
} from "@/jobs/queues/createAdvertisementQueue";
import createCategories from "@/services/createCategories";

(async () => {
  const category = await prisma.category.findFirstOrThrow({
    where: {
      id: "cljr7yybk008998cir7f38kxp"
    }
  })
  console.log(category);

  // const updatedCategory = await prisma.category.update({
  //   where: {
  //     id: "cljr7yybk008998cir7f38kxp"
  //   },
  //   data: {
  //     abortScript: false
  //   }
  // })
  // console.log(updatedCategory);


})();

export {};
