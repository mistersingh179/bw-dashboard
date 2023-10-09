import prisma from "@/lib/prisma";
import { User } from ".prisma/client";
import { Setting } from "@prisma/client";
import processWebsiteQueue from "@/jobs/queues/processWebsiteQueue";
import logger from "@/lib/logger";

const myLogger = logger.child({ name: "processUser" });

type ProcessUser = (user: User, settings: Setting) => Promise<void>;

const processUser: ProcessUser = async (user, settings) => {
  myLogger.info({ user }, "starting service");

  const websites = await prisma.website.findMany({
    where: {
      userId: user.id,
    },
  });

  myLogger.info({ length: websites.length }, "count of websites to process");

  for (const website of websites) {
    const job = await processWebsiteQueue.add("processWebsite", {
      website,
      settings,
    });
    myLogger.info(
      { job, topLevelDomainUrl: website.topLevelDomainUrl },
      "scheduled job to process website"
    );
  }

  myLogger.info({ user }, "finished service");
};

export default processUser;

if (require.main === module) {
  (async () => {
    const user = await prisma.user.findFirstOrThrow({
      where: {
        id: "cljvgedipcbyqph1qssejc7z5",
      },
      include: {
        setting: true,
      },
    });
    await processUser(user, user.setting!);
  })();
}
