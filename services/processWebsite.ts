import { Website } from ".prisma/client";
import prisma from "@/lib/prisma";
import { differenceInSeconds } from "date-fns";
import { Setting } from "@prisma/client";
import downloadWebpagesQueue, {
  queueEvents as downloadWebpagesQueueEvent,
} from "@/jobs/queues/downloadWebpagesQueue";
import processWebpageQueue from "@/jobs/queues/processWebpageQueue";

type ProcessWebsite = (website: Website, settings: Setting) => Promise<void>;

const processWebsite: ProcessWebsite = async (website, settings) => {
  console.log("inside service: processWebsite");

  const timeWhenDownloadingStarted = new Date();
  console.log("downloading started at: ", timeWhenDownloadingStarted);

  const job = await downloadWebpagesQueue.add("downloadWebpages", {
    website,
    settings,
  });
  await job.waitUntilFinished(downloadWebpagesQueueEvent, 1 * 60 * 60 * 1000);

  const timeWhenDownloadingFinished = new Date();
  console.log("downloading finished at: ", timeWhenDownloadingFinished);

  const downloadingTook = differenceInSeconds(
    timeWhenDownloadingFinished,
    timeWhenDownloadingStarted
  );
  console.log("downloading took: ", downloadingTook);

  const newlyAddedWebpages = await prisma.webpage.findMany({
    where: {
      createdAt: {
        gte: timeWhenDownloadingStarted,
      },
    },
  });

  console.log("newly added webpages count: ", newlyAddedWebpages.length);

  // todo - will build over only what was just inserted
  // todo - will not insert what was just updated

  for (const wp of newlyAddedWebpages) {
    const job = await processWebpageQueue.add("processWebpage", {
      webpage: wp,
    });
    console.log(`scheduled job: ${job.id} for wp: ${wp.url}`);
  }
};

export default processWebsite;

if (require.main === module) {
  (async () => {
    const website = await prisma.website.findFirstOrThrow({
      where: {
        id: "clij0qs2c004398lsf2uswwwc",
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
