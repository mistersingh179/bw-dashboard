import { Job, Queue, QueueEvents } from "bullmq";
import redisClient from "@/lib/redisClient";
import { DownloadWebpagesDataType } from "@/jobs/dataTypes";
import logger from "@/lib/logger";

const queueName = "downloadWebpages";

logger.info({ queueName }, "setting up queue");

const queue: Queue<DownloadWebpagesDataType, void> = new Queue(queueName, {
  connection: redisClient,
  defaultJobOptions: {
    removeOnComplete: 50,
    removeOnFail: 50,
  },
});

queue.on("error", (err) => {
  logger.error({ err }, "queue error");
});

queue.on("waiting", (job: Job) => {
  logger.info("queue waiting: ", job.queueName, job.name, job.id);
});

export const queueEvents = new QueueEvents(queueName, {
  connection: redisClient,
});

queueEvents.on("added", ({ jobId }) => {
  logger.info({ queueName, jobId }, "added job");
});

queueEvents.on("completed", async ({ jobId }) => {
  logger.info({ queueName, jobId }, "queue completed");
});

export default queue;
