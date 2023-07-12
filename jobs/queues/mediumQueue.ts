import {Queue, QueueEvents} from "bullmq";
import redisClient from "@/lib/redisClient";
import logger from "@/lib/logger";
import {MediumInputDataType, MediumJobNames, MediumOutputDataType} from "@/jobs/dataTypes";

const queueName = "medium";

logger.info({ queueName }, "setting up queue");

const queue: Queue<MediumInputDataType, MediumOutputDataType, MediumJobNames> = new Queue(queueName, {
  connection: redisClient,
  defaultJobOptions: {
    removeOnComplete: 1000,
    removeOnFail: 5000,
  },
});

queue.on("error", (err) => {
  logger.error({ err }, "queue error");
});

export const queueEvents = new QueueEvents(queueName, {
  connection: redisClient,
});

export default queue;
