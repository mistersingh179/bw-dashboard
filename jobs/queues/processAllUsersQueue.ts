import {Job, Queue, QueueEvents} from "bullmq";
import redisClient from "@/lib/redisClient";

export const queueName = "processAllUsers";

console.log("setting up queue: ", queueName);

const queue: Queue<void, void> = new Queue(queueName, {
  connection: redisClient,
  defaultJobOptions: {
    removeOnComplete: 1000,
    removeOnFail: 5000,
  },
});

queue.on("error", (err) => {
  console.log("there is an error on processUsersQueue: ", err);
});

queue.on("waiting", (job: Job) => {
  console.log("queue waiting: ", job.queueName, job.name, job.id);
});

export const queueEvents = new QueueEvents(queueName, {
  connection: redisClient,
});

queueEvents.on("added", async ({ jobId }) => {
  console.log("on queue ", queueName, " added jobId: ", jobId);
});

queueEvents.on("completed", async ({ jobId }) => {
  console.log("on queue ", queueName, " completed jobId: ", jobId);
});

export default queue;
