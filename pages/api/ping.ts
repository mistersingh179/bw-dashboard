import { NextApiHandler } from "next";
import withMiddleware from "@/middlewares/withMiddleware";
import { Job, Queue, QueueEvents } from "bullmq";
import fooQueue, { fooQueueEvents } from "@/queues/fooQueue";

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
