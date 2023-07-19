import { Job, MetricsTime, Worker } from "bullmq";
import redisClient from "@/lib/redisClient";
import { DEFAULT_WORKER_CONCURRENCY } from "@/constants";
import path from "path";
import { ProcessUserDataType } from "@/jobs/dataTypes";
import logger from "@/lib/logger";
import { pick } from "lodash";
import processUser from "@/services/process/processUser";

const queueName = "processUser";

logger.info({ queueName }, "setting up worker");

const worker: Worker<ProcessUserDataType, void> = new Worker(
  queueName,
  async (job) => {
    const { user, settings } = job.data;
    await processUser(user, settings);
  },
  {
    connection: redisClient,
    limiter: {
      max: 10,
      duration: 1000,
    },
    concurrency: DEFAULT_WORKER_CONCURRENCY,
    autorun: false,
    metrics: {
      maxDataPoints: MetricsTime.TWO_WEEKS,
    },
    
  }
);

worker.on("drained", () => {
  logger.info({ queueName }, "worker drained");
});

worker.on("active", (job) => {
  const jobItems = pick(job, ["queueName", "name", "id"]);
  logger.info({ jobItems }, "worker active");
});

worker.on("completed", (job: Job) => {
  const jobItems = pick(job, ["queueName", "name", "id"]);
  logger.info({ jobItems }, "worker completed");
});

worker.on("failed", (job: Job | undefined, err) => {
  const jobItems = pick(job, ["queueName", "name", "id"]);
  logger.error({ jobItems, err }, "worker failed");
});

worker.on("error", (err) => {
  console.log("worker has an error: ", err);
});

export default worker;
