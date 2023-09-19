import { Job, MetricsTime, Worker } from "bullmq";
import redisClient from "@/lib/redisClient";
import { DEFAULT_WORKER_CONCURRENCY } from "@/constants";
import logger from "@/lib/logger";
import { pick } from "lodash";
import {
  DownloadMostVisitedUrlsDataType,
  MediumInputDataType,
  MediumJobNames,
  MediumOutputDataType,
} from "@/jobs/dataTypes";
import downloadMostVisitedUrls from "@/services/downloadMostVisitedUrls";
import createMetaContents from "@/services/create/createMetaContents";
import { MetaContentSpot } from "@prisma/client";
import processWebpagesWithZeroMetaContentSpots from "@/services/process/processWebpagesWithZeroMetaContentSpots";
import nr from "newrelic";

const queueName = "medium";

const myLogger = logger.child({ name: "mediumWorker" });

const worker: Worker<
  MediumInputDataType,
  MediumOutputDataType,
  MediumJobNames
> = new Worker(
  queueName,
  async (job) => {
    const { name, data, opts } = job;
    myLogger.info({ name, data, opts }, "in processing function");
    switch (job.name) {
      case "downloadMostVisitedUrls":
        logger.info({ name, data, opts }, `in ${job.name} case`);
        const { website, settings } = data as DownloadMostVisitedUrlsDataType;
        return await nr.startBackgroundTransaction(
          "downloadMostVisitedUrls",
          async () => {
            return downloadMostVisitedUrls(website, settings);
          }
        );
      case "createMetaContents":
        logger.info({ name, data, opts }, `in ${job.name} case`);
        const metaContentSpot = data as MetaContentSpot;
        return await nr.startBackgroundTransaction(
          "createMetaContents",
          async () => {
            return createMetaContents(metaContentSpot);
          }
        );
      case "processWebpagesWithZeroMetaContentSpots":
        logger.info({ name, data, opts }, `in ${job.name} case`);
        return await nr.startBackgroundTransaction(
          "processWebpagesWithZeroMetaContentSpots",
          async () => {
            return processWebpagesWithZeroMetaContentSpots();
          }
        );
      default:
        logger.error({}, "got unknown job");
    }
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
