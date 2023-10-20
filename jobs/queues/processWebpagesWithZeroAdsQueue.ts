import { Job, Queue, QueueEvents } from "bullmq";
import redisClient from "@/lib/redisClient";
import logger from "@/lib/logger";
import { pick } from "lodash";

const queueName = "processWebpagesWithZeroAdsQueue";

logger.info({ queueName }, "setting up queue");

const queue: Queue<void, void> = new Queue(queueName, {
  connection: redisClient,
  defaultJobOptions: {
    removeOnComplete: 50,
    removeOnFail: 50,
  },
});

queue.on("error", (err) => {
  console.log("there is an error on processUsersQueue: ", err);
});

queue.on("waiting", (job: Job) => {
  const jobItems = pick(job, ["queueName", "name", "id"]);
  logger.info({ jobItems }, "queue waiting");
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
