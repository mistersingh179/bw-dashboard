import { Job, Queue, QueueEvents } from "bullmq";
import redisClient from "@/lib/redisClient";
import { ProcessWebpageDataType } from "@/jobs/dataTypes";
import logger from "@/lib/logger";
import { pick } from "lodash";

const queueName = "processWebpage";

logger.info({ queueName }, "setting up queue");

const queue: Queue<ProcessWebpageDataType, void> = new Queue(queueName, {
  connection: redisClient,
  defaultJobOptions: {
    removeOnComplete: 1000,
    removeOnFail: 5000,
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
