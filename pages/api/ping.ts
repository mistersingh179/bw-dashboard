import { NextApiHandler } from "next";
import withMiddleware from "@/middlewares/withMiddleware";
import barJob from "@/defer/barJob";

const ping: NextApiHandler = async (req, res) => {
  res.setHeader("Content-Type", "text/html");
  setTimeout(async () => {
    const job = await barJob();
    res.send("pong " + job?.id);

  }, 0);
};

export default withMiddleware("rejectBots")(ping);
