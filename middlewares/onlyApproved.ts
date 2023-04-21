import { Middleware } from "next-api-middleware";
import prisma from "@/lib/prisma";
import exp from "constants";

const onlyApproved: Middleware = async (req, res, next) => {
  console.log("in Only Founder Middleware with: ", req.authenticatedUserId);
  try{
    await prisma.user.findFirstOrThrow({
      where: {
        id: req.authenticatedUserId,
        email: {
          in: ["mistersingh179@gmail.com", "rod@sidekik.xyz"],
        },
      },
    });
    next();
  }catch(err){
    console.log('error when trying to find this user. silently failing');
    res.status(204).end();
  }
};

export default onlyApproved