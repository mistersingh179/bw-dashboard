import { Middleware } from "next-api-middleware";
import prisma from "@/lib/prisma";
import exp from "constants";
import logger from "@/lib/logger";

const foundersOnly: Middleware = async (req, res, next) => {
  const { authenticatedUserId } = req;
  logger.info({ authenticatedUserId }, "in Only Founder Middleware");
  try {
    await prisma.user.findFirstOrThrow({
      where: {
        id: req.authenticatedUserId,
        email: {
          in: ["mistersingh179@gmail.com", "rod@sidekik.xyz"],
        },
      },
    });
    await next();
  } catch (err) {
    const statusCode = 200;
    const message = "Aborting request as unable to verify user as founder";
    logger.info({ statusCode }, message);
    res.status(statusCode).send(message);
  }
};

export default foundersOnly;
