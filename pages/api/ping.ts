import { NextApiHandler } from "next";
import withMiddleware from "@/middlewares/withMiddleware";
import { Job, Queue, QueueEvents } from "bullmq";

const ping: NextApiHandler = async (req, res) => {
  res.setHeader("Content-Type", "text/html");
  res.send("pong");
};

export default withMiddleware("rejectBots")(ping);
