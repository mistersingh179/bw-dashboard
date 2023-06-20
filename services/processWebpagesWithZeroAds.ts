import logger from "@/lib/logger";
import prisma from "@/lib/prisma";
import getWebpagesWithZeroAds from "@/services/queries/getWebpagesWithZeroAds";
import processWebpageQueue from "@/jobs/queues/processWebpageQueue";

const myLogger = logger.child({ name: "processWebpagesWithZeroAds" });

type ProcessWebpagesWithZeroAds = () => Promise<void>;

const processWebpagesWithZeroAds: ProcessWebpagesWithZeroAds = async () => {
  myLogger.info({}, "inside service");
  const users = await prisma.user.findMany({
    where: {
      setting: {
        status: true,
      },
    },
    include: {
      websites: true,
    },
  });
  myLogger.info({ length: users.length }, "user count");
  for (const user of users) {
    myLogger.info({ user }, "processing user");
    for (const website of user.websites) {
      myLogger.info({ user, website }, "processing website");
      const webpages = await getWebpagesWithZeroAds(website.id);
      myLogger.info(
        {
          length: webpages.length,
          email: user.email,
          domain: website.topLevelDomainUrl,
        },
        "number of webpages with zero ads"
      );
      for (const webpage of webpages) {
        const job = await processWebpageQueue.add("processWebpage", {
          webpage: webpage,
        });
        myLogger.info(
          { id: job.id, webpage },
          "scheduled job to process Webpage"
        );
      }
    }
  }
};

export default processWebpagesWithZeroAds;

if (require.main === module) {
  (async () => {
    await processWebpagesWithZeroAds();
  })();
}
