import { Middleware } from "next-api-middleware";
import prisma from "@/lib/prisma";
import { User } from ".prisma/client";
import logger from "@/lib/logger";

export const getUser = async (userId: string): Promise<User> => {
  const user = await prisma.user.findFirstOrThrow({
    where: {
      id: userId,
    },
  });
  return user;
};

const canManageUsersMiddleware: Middleware = async (req, res, next) => {
  const { authenticatedUserId } = req;
  try {
    const user = await getUser(authenticatedUserId ?? "");
    if (user.canManageUsers === false) {
      console.log("Aborting as user is not allowed to manage users");
      res.status(403).end();
      return;
    } else {
      await next();
    }
  } catch (err) {
    const statusCode = 401;
    logger.error(
      { authenticatedUserId, statusCode, err },
      "ending response as authenticated user is not allowed to manage other users"
    );
    res.status(statusCode).end();
    return;
  }
};

export default canManageUsersMiddleware;
