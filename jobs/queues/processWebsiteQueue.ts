import { Job, Queue, QueueEvents } from "bullmq";
import redisClient from "@/lib/redisClient";
import { ProcessWebsiteDataType } from "@/jobs/dataTypes";
import logger from "@/lib/logger";
import { pick } from "lodash";

const queueName = "processWebsite";

logger.info({ queueName }, "setting up queue");

const queue: Queue<ProcessWebsiteDataType, void> = new Queue(queueName, {
  connection: redisClient,
  defaultJobOptions: {
    removeOnComplete: 50,
    removeOnFail: 50,
  },
});

queue.on("waiting", (job: Job) => {
  const jobItems = pick(job, ["queueName", "name", "id"]);
  logger.info({ jobItems }, "queue waiting");
});

queue.on("error", (err) => {
  logger.error({ err }, "queue error");
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
