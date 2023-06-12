import {Job, Queue, QueueEvents} from "bullmq";
import redisClient from "@/lib/redisClient";
import { Content, User, Webpage } from ".prisma/client";
import { Campaign, Setting } from "@prisma/client";

export const queueName = "createScoredCampaign";

console.log("setting up queue: ", queueName);

export type CreateScoredCampaignDataType = {
  webpage: Webpage;
  content: Content;
  settings: Setting;
  user: User;
  campaigns: Campaign[];
};

const queue: Queue<CreateScoredCampaignDataType, void> = new Queue(queueName, {
  connection: redisClient,
  defaultJobOptions: {
    removeOnComplete: 1000,
    removeOnFail: 5000,
  },
});

queue.on("error", (err) => {
  console.log("queue error: ", err);
});

queue.on("waiting", (job: Job) => {
  console.log("queue waiting: ", job.queueName, job.name, job.id);
});

export const queueEvents = new QueueEvents(queueName, {
  connection: redisClient,
});

queueEvents.on("added", async ({ jobId }) => {
  console.log("queue added: ", queueName, " added jobId: ", jobId);
});

queueEvents.on("completed", async ({ jobId }) => {
  console.log("queue completed ", queueName, " completed jobId: ", jobId);
});

export default queue;
