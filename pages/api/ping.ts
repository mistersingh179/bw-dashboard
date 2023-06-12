import { NextApiHandler } from "next";
import withMiddleware from "@/middlewares/withMiddleware";
import { Job, Queue, QueueEvents } from "bullmq";

const ping: NextApiHandler = async (req, res) => {
  res.setHeader("Content-Type", "text/html");
  res.status(200).send("pong");
};

export default withMiddleware()(ping);
