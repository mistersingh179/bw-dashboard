import { Website } from ".prisma/client";
import prisma from "@/lib/prisma";
import { differenceInSeconds } from "date-fns";
import { Setting } from "@prisma/client";
import downloadWebpagesQueue, {
  queueEvents as downloadWebpagesQueueEvent,
} from "@/jobs/queues/downloadWebpagesQueue";
import processWebpageQueue from "@/jobs/queues/processWebpageQueue";
import logger from "@/lib/logger";

const myLogger = logger.child({ name: "processWebsite" });

type ProcessWebsite = (website: Website, settings: Setting) => Promise<void>;

const processWebsite: ProcessWebsite = async (website, settings) => {
  myLogger.info(
    { topLevelDomainUrl: website.topLevelDomainUrl },
    "started service"
  );

  const timeWhenDownloadingStarted = new Date();
  myLogger.info({ timeWhenDownloadingStarted }, "downloading started");

  const job = await downloadWebpagesQueue.add("downloadWebpages", {
    website,
    settings,
  });
  myLogger.info(
    { topLevelDomainUrl: website.topLevelDomainUrl, id: job.id },
    "scheduled job to download webpages & waiting for it to finish"
  );
  await job.waitUntilFinished(downloadWebpagesQueueEvent, 1 * 60 * 60 * 1000);

  const timeWhenDownloadingFinished = new Date();
  myLogger.info({ timeWhenDownloadingFinished }, "downloading finished");

  const downloadingTook = differenceInSeconds(
    timeWhenDownloadingFinished,
    timeWhenDownloadingStarted
  );
  myLogger.info({ downloadingTook }, "downloading took");

  const newlyAddedWebpages = await prisma.webpage.findMany({
    where: {
      websiteId: website.id,
      createdAt: {
        gte: timeWhenDownloadingStarted,
      },
    },
  });

  myLogger.info(
    { length: newlyAddedWebpages.length },
    "newly added webpages count"
  );

  // todo - will build over only what was just inserted
  // todo - will not insert what was just updated

  for (const wp of newlyAddedWebpages) {
    const job = await processWebpageQueue.add("processWebpage", {
      webpage: wp,
    });
    myLogger.info(
      { id: job.id, url: wp.url },
      "scheduled job to process Webpage"
    );
  }
};

export default processWebsite;

if (require.main === module) {
  (async () => {
    const website = await prisma.website.findFirstOrThrow({
      where: {
        id: "cljahkmbn003p98kclricdbpm",
      },
    });
    const settings = await prisma.setting.findFirstOrThrow({
      where: {
        user: {
          websites: {
            some: {
              id: website.id,
            },
          },
        },
      },
    });
    await processWebsite(website, settings);
  })();
}
