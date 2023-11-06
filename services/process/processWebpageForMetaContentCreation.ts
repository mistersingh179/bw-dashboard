import logger from "@/lib/logger";
import { MetaContentSpot, Webpage } from "@prisma/client";
import prisma from "@/lib/prisma";
import redisClient from "@/lib/redisClient";
import { createId } from "@paralleldrive/cuid2";
import {
  META_CONTENT_BUILD_FAIL_COUNT_LIMIT,
  META_CONTENT_BUILD_LOCK_TIME,
} from "@/constants";
import MediumQueue from "@/jobs/queues/mediumQueue";

type ProcessWebpageForMetaContentCreation = (
  webpage: Webpage
) => Promise<string[]>;

export const accquireLock = async (key: string, timePeriod: number) => {
  logger.info("in getLock");
  /*
  set the key only if it does not already exist – NX,
  set it with an expiration – EX
  returns OK if set was performed
  return NULL if set was not performed since key already existed & NX was supplied
  client or anyone else can remove lock by deleting the key
  lock also auto removes when the key expires
  checking the value before deleting key ensures that other clients don't delete the key by mistake
  */
  const value = createId();
  logger.info({ key, value }, "attempting to get lock");

  const ans = await redisClient.set(key, value, "EX", timePeriod, "NX");
  if (ans !== "OK") {
    logger.info({}, "unable to get redis lock");
    return false;
  } else {
    logger.info({ ans, key, value }, "got lock");
    return true;
  }
};

const keyBuilder = (webpage: Webpage, metaContentSpot: MetaContentSpot) => {
  return `ProcessWebpageForMetaContentCreation:${webpage.id}:${metaContentSpot.id}`;
};

const processWebpageForMetaContentCreation: ProcessWebpageForMetaContentCreation =
  async (webpage) => {
    const myLogger = logger.child({
      name: "processWebpageForMetaContentCreation",
      webpage,
    });

    myLogger.info({}, "started service");

    const pendingSpots = await prisma.metaContentSpot.findMany({
      where: {
        webpageId: webpage.id,
        metaContents: {
          none: {
            metaContentSpot: {
              webpageId: webpage.id
            }
          },
        },
        buildFailCount: {
          lt: META_CONTENT_BUILD_FAIL_COUNT_LIMIT,
        },
      },
    });

    if (pendingSpots.length === 0) {
      myLogger.info({}, "aborting as pendingSpots count is 0");
      return [];
    } else {
      myLogger.info({}, "will continue as we have pendingSpots");
    }

    const jobIds: string[] = [];
    for (const mcs of pendingSpots) {
      const key = keyBuilder(webpage, mcs);
      const lockResult = await accquireLock(key, META_CONTENT_BUILD_LOCK_TIME);
      if (lockResult === true) {
        const job = await MediumQueue.add("createMetaContents", mcs);
        const { id: jobId } = job;
        myLogger.info({ jobId, mcs }, "job added create metaContent");
        if (jobId) {
          jobIds.push(jobId);
        }
      }
    }

    myLogger.info({ jobIds, countOfJobIds: jobIds.length }, "finished service");
    return jobIds;
  };

export default processWebpageForMetaContentCreation;

if (require.main === module) {
  (async () => {
    const webpage = await prisma.webpage.findFirstOrThrow({
      where: {
        id: "clnamlh5q000098qquhih5isq",
      },
    });
    await processWebpageForMetaContentCreation(webpage);
  })();
}
