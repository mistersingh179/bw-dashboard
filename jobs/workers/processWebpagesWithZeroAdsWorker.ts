import { Job, MetricsTime, Worker } from "bullmq";
import redisClient from "@/lib/redisClient";
import { DEFAULT_WORKER_CONCURRENCY } from "@/constants";
import path from "path";
import logger from "@/lib/logger";
import { pick } from "lodash";
import processWebpagesWithZeroAds from "@/services/processWebpagesWithZeroAds";

const queueName = "processWebpagesWithZeroAdsQueue";

logger.info({ queueName }, "setting up worker");

const worker: Worker<void, void> = new Worker(
  queueName,
  async (job) => {
    await processWebpagesWithZeroAds();
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

worker.on("completed", (job: Job) => {
  const jobItems = pick(job, ["queueName", "name", "id"]);
  logger.info({ jobItems }, "worker completed");
});

worker.on("active", (job) => {
  const jobItems = pick(job, ["queueName", "name", "id"]);
  logger.info({ jobItems }, "worker active");
});

worker.on("failed", (job: Job | undefined, err) => {
  const jobItems = pick(job, ["queueName", "name", "id"]);
  logger.error({ jobItems, err }, "worker failed");
});

worker.on("error", (err) => {
  console.log("worker has an error: ", err);
});

export default worker;
