import { Job, MetricsTime, Worker } from "bullmq";
import redisClient from "@/lib/redisClient";
import { queueName } from "@/jobs/queues/createAdvertisementQueue";
import { DEFAULT_WORKER_CONCURRENCY } from "@/constants";
import path from "path";
import { CreateAdvertisementDataType } from "@/jobs/dataTypes";

console.log("setting up worker for: ", queueName);

const processorFile = path.join(
  __dirname,
  "..",
  "sandboxedProcessors",
  "createAdvertisementSandboxProcessor.ts"
);
console.log("processorFile: ", processorFile);

const worker: Worker<CreateAdvertisementDataType, void> = new Worker(
  queueName,
  processorFile,
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
    useWorkerThreads: true,
  }
);

worker.on("drained", () => {
  console.log("worker drained: ", queueName);
});

worker.on("active", (job) => {
  console.log("worker actve: ", job.queueName, job.name, job.id);
});

worker.on("completed", (job: Job) => {
  console.log("worker completed: ", job.queueName, job.name, job.id);
});

worker.on("failed", (job: Job | undefined, err) => {
  console.log("worker failed: ", job?.queueName, job?.name, job?.id);
});

worker.on("error", (err) => {
  console.log("worker error: ", err);
});

export default worker;
