import processAllUsersQueue from "@/jobs/queues/processAllUsersQueue";
import logger from "@/lib/logger";
import { pick } from "lodash";
import processWebpagesWithZeroAdsQueue from "@/jobs/queues/processWebpagesWithZeroAdsQueue";
import mediumQueue from "@/jobs/queues/mediumQueue";

const addProcessAllUsers = async () => {
  const job = await processAllUsersQueue.add("processAllUsers", undefined, {
    repeat: {
      pattern: "0 4 * * *",
    },
  });
  const jobItems = pick(job, ["qeueuName", "name", "id"]);
  logger.info({ jobItems }, "scheduled job");
};

const addProcessWebpagesWithZeroAds = async () => {
  const job = await processWebpagesWithZeroAdsQueue.add(
    "processWebpagesWithZeroAds",
    undefined,
    {
      repeat: {
        pattern: "0 6 * * *",
      },
    }
  );
  const jobItems = pick(job, ["qeueuName", "name", "id"]);
  logger.info({ jobItems }, "scheduled job");
};

const addProcessWebpagesWithZeroMetaContentSpots = async () => {
  const job = await mediumQueue.add(
    "processWebpagesWithZeroMetaContentSpots",
    undefined,
    {
      repeat: {
        pattern: "0 7 * * *",
      },
    }
  );
  const jobItems = pick(job, ["qeueuName", "name", "id"]);
  logger.info({ jobItems }, "scheduled job");
};

const setupCronJobs = async () => {
  logger.info({}, "starting scheduling cron jobs");
  await addProcessAllUsers();
  await addProcessWebpagesWithZeroAds();
  await addProcessWebpagesWithZeroMetaContentSpots();
  logger.info("finished scheduling cron jobs");
};

export default setupCronJobs;
