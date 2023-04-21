import { Middleware } from "next-api-middleware";
import Cors from "cors";

const cors = Cors()
const corsMiddleware: Middleware = async (req, res, next) => {
  console.log("in cors middleware")
  cors(req, res, next);
};

export default corsMiddleware;
