import { Job, MetricsTime, Worker } from "bullmq";
import redisClient from "@/lib/redisClient";
import { Campaign } from ".prisma/client";
import processCampaign from "@/services/processCampaign";
import {
  ProcessCampaignDataType,
  queueName,
} from "@/jobs/queues/processCampaignQueue";
import { DEFAULT_WORKER_CONCURRENCY } from "@/constants";

console.log("setting up worker for: ", queueName);

const worker: Worker<ProcessCampaignDataType, void> = new Worker(
  queueName,
  async (job) => {
    console.log("processCampaignWorker", job.name, job.id, job.queueName);
    const { campaign } = job.data;
    await processCampaign(campaign);
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
  console.log("worker drained: ", queueName);
});

worker.on("active", (job) => {
  console.log("worker actve: ", job.queueName, job.name, job.id );
});

worker.on("completed", (job: Job) => {
  console.log("worker completed: ", job.queueName, job.name, job.id);
});

worker.on("failed", (job: Job | undefined, err) => {
  console.log("worker failed: ", job?.queueName, job?.name, job?.id);
});
worker.on("error", (err) => {
  console.log("worker has an error: ", err);
});

export default worker;
