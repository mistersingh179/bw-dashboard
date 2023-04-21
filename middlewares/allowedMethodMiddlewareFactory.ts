import { Middleware } from "next-api-middleware";

const allowedMethodMiddlewareFactory = (methodNames: string[]): Middleware => {
  return async (req, res, next) => {
    console.log("in Allowed Method middleware with: ", req.method , " and we allow: ", methodNames);
    if (req.method && methodNames.includes(req.method)) {
      await next();
    } else {
      res.status(405);
      res.end();
    }
  };
};

export default allowedMethodMiddlewareFactory;
