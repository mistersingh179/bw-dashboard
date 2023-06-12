import {Job, Queue, QueueEvents} from "bullmq";
import redisClient from "@/lib/redisClient";
import { Webpage } from ".prisma/client";

export const queueName = "processWebpage";

console.log("setting up queue: ", queueName);

export type ProcessWebpageDataType = {webpage: Webpage};

const queue: Queue<ProcessWebpageDataType, void> = new Queue(queueName, {
  connection: redisClient,
  defaultJobOptions: {
    removeOnComplete: 1000,
    removeOnFail: 5000,
  },
});

queue.on("waiting", (job: Job) => {
  console.log("queue waiting: ", job.queueName, job.name, job.id);
});

queue.on("error", (err) => {
  console.log("there is an error on processWebpageQueue: ", err);
});

export const queueEvents = new QueueEvents(queueName, {
  connection: redisClient,
});

queueEvents.on("added", async ({ jobId }) => {
  console.log("on queue ", queueName, " added jobId: ", jobId);
});

queueEvents.on("completed", async ({ jobId }) => {
  console.log("on queue ", queueName, " completed jobId: ", jobId);
  // const job = await Job.fromId(processingQueue, jobId);
  // if (job?.returnvalue) {
  //   console.log("and got back: ", job.returnvalue);
  // }
});

export default queue;
