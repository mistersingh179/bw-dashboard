import { NextApiHandler } from "next";
import withMiddleware from "@/middlewares/withMiddleware";

const ping: NextApiHandler = async (req, res) => {
  res.setHeader("Content-Type", "text/html");
  setTimeout(() => {
    res.send("pong");
  }, 0);
};

export default withMiddleware("rejectBots")(ping);
