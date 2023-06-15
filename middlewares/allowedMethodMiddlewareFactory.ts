import {Middleware} from "next-api-middleware";

const allowedMethodMiddlewareFactory = (methodNames: string[]): Middleware => {
  return async (req, res, next) => {
    if (req.method && methodNames.includes(req.method)) {
      await next();
    } else {
      res.status(405);
      res.end();
    }
  };
};

export const getPostOnlyMethodMiddleware = allowedMethodMiddlewareFactory([
  "GET",
  "POST",
]);

export const getPutDeleteOnlyMethodMiddleware = allowedMethodMiddlewareFactory([
  "GET",
  "PUT",
  "DELETE",
]);

export const getOnlyMethodMiddleware = allowedMethodMiddlewareFactory([
  "GET",
]);

export const postOnlyMethodMiddleware = allowedMethodMiddlewareFactory([
  "POST",
]);

export default allowedMethodMiddlewareFactory;
