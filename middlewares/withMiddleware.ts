import { label, LabeledMiddleware } from "next-api-middleware";
import loggingMiddleware from "@/middlewares/loggingMiddleware";
import customHeadersMiddleware from "@/middlewares/customHeadersMiddleware";
import corsMiddleware from "@/middlewares/corsMiddleware";
import captureErrors from "@/middlewares/caputreErrorMiddleware";
import authCheckMiddleware from "@/middlewares/authCheckMiddleware";
import requestIdMiddleware from "@/middlewares/requestIdMiddleware";
import foundersOnly from "@/middlewares/foundersOnly";
import {
  getOnlyMethodMiddleware,
  getPostOnlyMethodMiddleware,
  getPutDeleteOnlyMethodMiddleware, postOnlyMethodMiddleware
} from "@/middlewares/allowedMethodMiddlewareFactory";
import delayMiddleware from "@/middlewares/delayMiddleware";

const defaults: string[] = ["reqId", "logging", "headers", "errors", "delay"];

const middleware: LabeledMiddleware = {
  logging: loggingMiddleware,
  headers: customHeadersMiddleware,
  cors: corsMiddleware,
  errors: captureErrors,
  auth: authCheckMiddleware,
  reqId: requestIdMiddleware,
  foundersOnly: foundersOnly,
  getPostOnly: getPostOnlyMethodMiddleware,
  getOnly: getOnlyMethodMiddleware,
  getPutDeleteOnly: getPutDeleteOnlyMethodMiddleware,
  postOnly: postOnlyMethodMiddleware,
  delay: delayMiddleware,
};

const withMiddleware = label(middleware, defaults);

export default withMiddleware;
