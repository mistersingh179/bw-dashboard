// Helper method to wait for a middleware to execute before continuing
// And to throw an error when an error happens in a middleware
import { NextApiRequest, NextApiResponse } from "next";

const runMiddleware = async (
  req: NextApiRequest,
  res: NextApiResponse,
  middlewareFn: Function
) => {
  return new Promise((resolve, reject) => {
    middlewareFn(req, res, (result: any) => {
      if (result instanceof Error) {
        return reject(result);
      }

      return resolve(result);
    });
  });
};

export default runMiddleware;