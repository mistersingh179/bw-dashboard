import { Middleware } from "next-api-middleware";

const captureErrors: Middleware = async (req, res, next) => {
  // Catch any errors that are thrown in remaining middleware and the API route handler
  try {
    await next();
  } catch (err) {
    res.status(500);
    res.json({ error: err });
  }
};

export default captureErrors