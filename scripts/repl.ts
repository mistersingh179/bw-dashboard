import getLogger from "../lib/logger";
import prisma from "@/lib/prisma";
import logger from "../lib/logger";
import { stripHtml } from "string-strip-html";
import createAdvertisementQueue, {
  queueEvents,
} from "@/jobs/queues/createAdvertisementQueue";

(async () => {
  const adSpots = await prisma.advertisementSpot.findMany({
    where: {
      webpageId: "cliywitpj0004989og13txyko",
    },
  });

  const scoredCamps = await prisma.scoredCampaign.findMany({
    where: {
      webpageId: "cliywitpj0004989og13txyko",
    },
  });

  const settings = await prisma.setting.findMany({
    where: {
      id: "cli3wxalx000098gd2vzqh8if"
    },
  });

  const job = await createAdvertisementQueue.add("createAdvertisement", {
    advertisementSpot: adSpots[0],
    scoredCampaign: scoredCamps[0],
    settings: settings[0]
  });
  console.log("job: ", job.id);
  const result = await job.waitUntilFinished(queueEvents);
  console.log("***ans: ", result);
})();

export {};
