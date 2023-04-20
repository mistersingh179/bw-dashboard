import { label, LabeledMiddleware } from "next-api-middleware";
import loggingMiddleware from "@/middlewares/loggingMiddleware";
import customHeadersMiddleware from "@/middlewares/customHeadersMiddleware";
import corsMiddleware from "@/middlewares/corsMiddleware";
import captureErrors from "@/middlewares/caputreErrorMiddleware";

const defaults: string[] = ["logging", "headers", "errors"];

const middleware: LabeledMiddleware = {
  logging: loggingMiddleware,
  headers: customHeadersMiddleware,
  cors: corsMiddleware,
  errors: captureErrors,
};

const withMiddleware = label(middleware, defaults);

export default withMiddleware;
