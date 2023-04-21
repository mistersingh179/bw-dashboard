import { label, LabeledMiddleware } from "next-api-middleware";
import loggingMiddleware from "@/middlewares/loggingMiddleware";
import customHeadersMiddleware from "@/middlewares/customHeadersMiddleware";
import corsMiddleware from "@/middlewares/corsMiddleware";
import captureErrors from "@/middlewares/caputreErrorMiddleware";
import authCheckMiddleware from "@/middlewares/authCheckMiddleware";
import requestIdMiddleware from "@/middlewares/requestIdMiddleware";
import onlyApproved from "@/middlewares/onlyApproved";

const defaults: string[] = ["reqId", "logging", "headers", "errors"];

const middleware: LabeledMiddleware = {
  logging: loggingMiddleware,
  headers: customHeadersMiddleware,
  cors: corsMiddleware,
  errors: captureErrors,
  auth: authCheckMiddleware,
  reqId: requestIdMiddleware,
  onlyApproved: onlyApproved,
};

const withMiddleware = label(middleware, defaults);

export default withMiddleware;
