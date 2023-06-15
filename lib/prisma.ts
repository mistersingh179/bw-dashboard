import {Prisma, PrismaClient} from "@prisma/client";
import logger from "@/lib/logger";

// PrismaClient is attached to the `global` object in development to prevent
// exhausting your database connection limit.
//
// Learn more:
// https://pris.ly/d/help/next-js-best-practices

const myLogger = logger.child({ name: "prisma" });

const globalForPrisma = global as unknown as {
  prisma: PrismaClient<Prisma.PrismaClientOptions, "query" | "info" | "warn" | "error">;
};

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    errorFormat: "pretty",
    log: [
      {
        emit: "event",
        level: "query",
      },
      {
        emit: "event",
        level: "error",
      },
      {
        emit: "event",
        level: "info",
      },
      {
        emit: "event",
        level: "warn",
      },
    ],
  });

prisma.$on("query", (e) => {
  myLogger.debug({ e }, "query");
});

prisma.$on("info", (e) => {
  myLogger.info({ e }, e.message);
});

prisma.$on("warn", (e) => {
  myLogger.warn({ e }, e.message);
});

prisma.$on("error", (e) => {
  myLogger.error({ e }, e.message);
});

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

export default prisma;
