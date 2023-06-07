import { NextApiHandler } from "next";
import withMiddleware from "@/middlewares/withMiddleware";
import Redis from "ioredis";
import { Job, Queue, QueueEvents } from "bullmq";

const { REDIS_HOST } = process.env;
const REDIS_PORT = Number(process.env.REDIS_PORT) || 0;
const REDIS_URL = String(process.env.REDIS_URL) ?? "";
console.log("REDIS_URL: ", REDIS_URL);

let client = new Redis(REDIS_URL, {
  maxRetriesPerRequest: null,
  enableReadyCheck: false,
});

const fooQueue = new Queue("foo", {
  connection: client,
  defaultJobOptions: {
    removeOnComplete: 1000,
    removeOnFail: 5000,
  },
});
const fooQueueEvents = new QueueEvents("foo", {
  connection: client,
});

const ping: NextApiHandler = async (req, res) => {
  res.setHeader("Content-Type", "text/html");
  const job: Job<any, string> = await fooQueue.add("myJobName", {
    foo: "bar",
  });
  const result = await job.waitUntilFinished(fooQueueEvents, 2000);
  console.log("job: ", job.id, job.data, job.returnvalue, result);
  res.send("pong " + job.id + " " + result);
};

export default withMiddleware("rejectBots")(ping);
