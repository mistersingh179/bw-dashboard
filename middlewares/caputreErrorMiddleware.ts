import { Middleware } from "next-api-middleware";
import superjson from "superjson";

const captureErrors: Middleware = async (req, res, next) => {
  // Catch any errors that are thrown in remaining middleware and the API route handler
  console.log("in Capture Errors middleware");
  try {
    await next();
  } catch (err) {
    res
      .setHeader("Content-Type", "application/json")
      .status(500)
      .send(superjson.stringify({ message: (err as Error)?.message }));
    console.log("error: ", (err as Error)?.message);
  }
};

export default captureErrors;
