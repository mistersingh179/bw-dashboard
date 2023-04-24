import { Middleware } from "next-api-middleware";
import cors from "cors";

const corsMiddleware: Middleware = async (req, res, next) => {
  console.log("in cors middleware")
  await (cors()(req, res, next));
};

export default corsMiddleware;
