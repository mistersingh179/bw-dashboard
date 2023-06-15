import getLogger from "../lib/logger";
import prisma from "@/lib/prisma";
import logger from "../lib/logger";

(async () => {
  const user = await prisma.user.findFirstOrThrow();
  const user2 = await prisma.user.findFirstOrThrow();
  logger.info({}, "bar");
})();

export {};
