import { NextApiHandler } from "next";
import withMiddleware from "@/middlewares/withMiddleware";

const ping: NextApiHandler = async (req, res) => {
  res.setHeader("Content-Type", "text/html");
  res.send("thanks");
};

export default withMiddleware("rejectBots")(ping);
