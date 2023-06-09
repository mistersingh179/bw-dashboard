import { Job, Worker } from "bullmq";
import { User } from ".prisma/client";
import prisma from "@/lib/prisma";
import redisClient from "@/lib/redisClient";


const worker = new Worker(
  "foo",
  async (job: Job) => {
    console.log("in worker of foo.");
    console.log("job.data: ", job.data);
    console.log("job.id: ", job.id);
    console.log("job.name: ", job.name);
    console.log("job.queueName: ", job.queueName);
    // await sleep(100);
    return "a thanks from the foo worker.";
  },
  {
    connection: redisClient,
  }
);

worker.on("error", (err) => {
  console.log("worker has an error: ", err);
})

process.on("SIGINT", async () => {
  console.log("started graceful shutdown");
  await worker.close();
  console.log("finished doing graceful shutdown");
  process.exit(0);
});

process.on("uncaughtException", function (err) {
  // Handle the error safely
  console.log("Uncaught exception: ", err);
});

process.on("unhandledRejection", (reason, promise) => {
  // Handle the error safely
  console.error("Unhandled Rejection at: Promise: ", { promise, reason });
});

if (require.main == module) {
  (async () => {
    console.log("inside fooWorker");
    const user: User | null = await prisma.user.findFirst();
    console.log("and we got user: ", user);

    // console.log("adding job");
    // const fooQueue = new Queue("foo", {
    //   connection: client,
    //   defaultJobOptions: {
    //     removeOnComplete: 1000,
    //     removeOnFail: 5000,
    //   },
    // });
    // const fooQueueEvents = new QueueEvents("foo", {
    //   connection: client
    // });
    // const job: Job<any, string> = await fooQueue.add("myJobName", {
    //   foo: "bar",
    // });
    // const result = await job.waitUntilFinished(fooQueueEvents, 2000);
    // console.log("job: ", job.id, job.data, job.returnvalue, result);
  })();
}

// export default worker;
