import processAllUsersQueue from "@/jobs/queues/processAllUsersQueue";
import logger from "@/lib/logger";
import { pick } from "lodash";

const setupCronJobs = async () => {
  logger.info({}, "starting scheduling cron jobs");
  const job = await processAllUsersQueue.add("processAllUsers", undefined, {
    repeat: {
      pattern: "0 18 * * *",
    },
  });
  const jobItems = pick(job, ["qeueuName", "name", "id"]);
  logger.info({ jobItems }, "scheduled job");
  logger.info("finished scheduling cron jobs");
};

export default setupCronJobs;
