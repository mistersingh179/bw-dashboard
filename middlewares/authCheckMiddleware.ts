import { Middleware } from "next-api-middleware";
import exp from "constants";
import { getServerSession } from "next-auth";
import { authOptions } from "@/pages/api/auth/[...nextauth]";

const authCheckMiddleware: Middleware = async (req, res, next) => {
  const session = await getServerSession(req, res, authOptions);
  if (session?.user?.id) {
    req.authenticatedUserId = session.user.id;
    await next();
  } else {
    res.status(401).end();
  }
};

export default authCheckMiddleware;
