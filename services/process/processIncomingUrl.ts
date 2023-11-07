import logger from "@/lib/logger";
import prisma from "@/lib/prisma";
import { Webpage } from ".prisma/client";
import processWebpageQueue, {
  queueEvents as processWebpageQueueEvents,
} from "@/jobs/queues/processWebpageQueue";
import { getUrlProperties } from "@/lib/getUrlProperites";
import processWebpageForMetaContentCreation from "@/services/process/processWebpageForMetaContentCreation";

const myLogger = logger.child({ name: "processIncomingUrl" });

type ProcessIncomingUrl = (userId: string, url: string) => Promise<Webpage>;

const processIncomingUrl: ProcessIncomingUrl = async (userId, url) => {
  myLogger.info({ userId, url }, "inside service");
  const { origin, originWithPathName } = getUrlProperties(url);
  myLogger.info({ origin, originWithPathName}, "website url");

  const webpage = await prisma.webpage.create({
    data: {
      url: originWithPathName,
      status: true,
      website: {
        connect: {
          userId_topLevelDomainUrl: {
            topLevelDomainUrl: origin,
            userId,
          },
        },
      },
    },
    include: {
      website: true,
    },
  });

  myLogger.info({ webpage }, "webpage has been created");

  const job = await processWebpageQueue.add("processWebpage", { webpage });
  logger.info({ webpage, id: job.id }, "scheduled job to process webpage");

  await job.waitUntilFinished(processWebpageQueueEvents, 1 * 60 * 60 * 1000);
  logger.info({ webpage, id: job.id }, "finished processing webpage");

  logger.info({}, "starting meta content creation");
  const jobIds = await processWebpageForMetaContentCreation(webpage);
  logger.info({ jobIds }, "schedules jobs to create meta content");

  return webpage;
};

export default processIncomingUrl;

if (require.main === module) {
  (async () => {
    await processIncomingUrl(
      "cljcsweqt68k4k81qozbo4uky",
      "https://outinjersey.net/new-jersey-congressman-tom-kean-jr-enables-anti-lgbtq-extremism"
    );
  })();
}
