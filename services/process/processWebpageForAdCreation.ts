import logger from "@/lib/logger";
import { ScoredCampaign, Setting, Webpage } from "@prisma/client";
import prisma from "@/lib/prisma";
import createAdvertisementQueue from "@/jobs/queues/createAdvertisementQueue";
import getBestCampaignForWebpage from "@/services/queries/getBestCampaignForWebpage";
import redisClient from "@/lib/redisClient";
import { Website } from ".prisma/client";
import { createId } from "@paralleldrive/cuid2";
import { AD_BUILD_FAIL_COUNT_LIMIT, AD_BUILD_LOCK_TIME } from "@/constants";

type ProcessWebpageForAdCreation = (
  webpage: Webpage,
  scoredCampaign: ScoredCampaign,
  settings: Setting
) => Promise<string[]>;

const keyBuilder = (webpage: Webpage, scoredCampaign: ScoredCampaign) => {
  return `ProcessWebpageForAdCreation:${webpage.id}:${scoredCampaign.id}`;
};

const processWebpageForAdCreation: ProcessWebpageForAdCreation = async (
  webpage,
  scoredCampaign,
  settings
) => {
  const myLogger = logger.child({
    name: "processWebpageForAdCreation",
    webpage,
    scoredCampaign,
    settings,
  });

  myLogger.info({}, "started service");

  if (scoredCampaign.adBuildFailCount >= AD_BUILD_FAIL_COUNT_LIMIT) {
    myLogger.info({}, "aborting as adBuildFailCount has reached limit");
    return [];
  } else {
    myLogger.info({}, "will continue as adBuildFailCount is under limit");
  }

  /*
  set the key only if it does not already exist – NX,
  set it with an expiration – EX
  returns OK if set was performed
  return NULL if set was not performed since key already existed & NX was supplied
  client or anyone else can remove lock by deleting the key
  lock also auto removes when the key expires
  checking the value before deleting key ensures that other clients don't delete the key by mistake
  */

  const key = keyBuilder(webpage, scoredCampaign);
  const value = createId();

  myLogger.info(
    { key, value },
    "making request to get redis lock for creating ads"
  );

  const ans = await redisClient.set(key, value, "EX", AD_BUILD_LOCK_TIME, "NX");
  if (ans !== "OK") {
    myLogger.info({}, "aborting as unable to get redis lock for ad creation");
    return [];
  } else {
    myLogger.info({ ans, key, value }, "got redis lock for creating ads");
  }

  const advertisementSpots = await prisma.advertisementSpot.findMany({
    where: {
      webpageId: webpage.id,
    },
  });

  myLogger.info({ advertisementSpots }, "going to build ads for these spots");

  const jobIds: string[] = [];
  for (const advertisementSpot of advertisementSpots) {
    const { id: jobId } = await createAdvertisementQueue.add(
      "createAdvertisement",
      {
        advertisementSpot,
        scoredCampaign,
        settings,
      }
    );
    myLogger.info({ jobId, advertisementSpot }, "added job to create ad");
    if (jobId) {
      jobIds.push(jobId);
    }
  }

  myLogger.info({ jobIds }, "finished service");
  return jobIds;
};

export default processWebpageForAdCreation;

if (require.main === module) {
  (async () => {
    const webpage = await prisma.webpage.findFirstOrThrow({
      where: {
        id: "clk9r8fj800049889eu3qpvxt",
      },
    });
    const scoredCampaign = await prisma.scoredCampaign.findFirstOrThrow({
      where: {
        webpageId: webpage.id,
      },
    });
    const settings = await prisma.setting.findFirstOrThrow({
      where: {
        userId: "clhtwckif000098wp207rs2fg",
      },
    });
    await processWebpageForAdCreation(webpage, scoredCampaign, settings);
  })();
}
