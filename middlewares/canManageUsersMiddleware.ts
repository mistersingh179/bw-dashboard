import { Middleware } from "next-api-middleware";
import exp from "constants";
import { getServerSession } from "next-auth";
import { authOptions } from "@/pages/api/auth/[...nextauth]";
import {Setting} from "@prisma/client";
import prisma from "@/lib/prisma";
import {User} from ".prisma/client";

export const getUser = async (userId: string): Promise<User> => {
  const user = await prisma.user.findFirstOrThrow({
    where: {
      id: userId,
    },
  });
  return user;
};

const canManageUsersMiddleware: Middleware = async (req, res, next) => {
  try{
    const user = await getUser(req?.authenticatedUserId ?? "");
    if (user.canManageUsers === false) {
      console.log("Aborting as user is not allowed to manage users");
      res.status(403).end();
      return;
    } else {
      await next();
    }
  }catch(err){
    console.log("not user found: ", req?.authenticatedUserId, err);
    res.status(404).end();
    return;
  }
};

export default canManageUsersMiddleware;
