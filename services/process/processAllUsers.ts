import prisma from "@/lib/prisma";
import processUserQueue from "@/jobs/queues/processUserQueue";
import logger from "@/lib/logger";

const myLogger = logger.child({ name: "ProcessAllUsers" });

type ProcessAllUsers = () => Promise<void>;

const processAllUsers: ProcessAllUsers = async () => {
  myLogger.info({}, "started processAllUsers");

  const users = await prisma.user.findMany({
    where: {
      setting: {
        OR: [
          {
            webpageLookbackDays: {
              gt: 0,
            },
          },
          {
            allTimeMostVisitedUrlCount: {
              gt: 0,
            },
          },
          {
            recentlyMostVisitedUrlCount: {
              gt: 0,
            },
          },
        ],
      },
    },
    include: {
      setting: true,
    },
  });

  myLogger.info({ length: users.length }, "user count to process");

  for (const user of users) {
    if (!user.setting) {
      logger.error({ user }, "skipping as user has no settings");
      continue;
    }
    const job = await processUserQueue.add("processUser", {
      user,
      settings: user.setting,
    });
    myLogger.info({ email: user.email, job }, "schedule job to process user");
  }

  myLogger.info({}, "finished service");
};

export default processAllUsers;
