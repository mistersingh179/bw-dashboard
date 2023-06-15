import { Middleware } from "next-api-middleware";
import superjson from "superjson";
import logger from "@/lib/logger";

const captureErrors: Middleware = async (req, res, next) => {
  // Catch any errors that are thrown in remaining middleware and the API route handler
  try {
    await next();
  } catch (err) {
    res
      .setHeader("Content-Type", "application/json")
      .status(500)
      .send(superjson.stringify({ message: (err as Error)?.message }));
    logger.error(err, "caught an error in the api request");
  }
};

export default captureErrors;
