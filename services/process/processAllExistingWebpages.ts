import logger from "@/lib/logger";
import prisma from "@/lib/prisma";
import processWebpageQueue from "@/jobs/queues/processWebpageQueue";
import postOnSlack from "@/lib/postOnSlack";
import { User } from ".prisma/client";

const myLogger = logger.child({
  name: "processAllExistingWebpages",
});

type ProcessAllExistingWebpages = (userId: string) => Promise<number>;

const processAllExistingWebpages: ProcessAllExistingWebpages = async (userId) => {
  myLogger.info({ userId }, "inside service");

  const webpages = await prisma.webpage.findMany({
    where: {
      website: {
        userId
      },
    },
  });

  myLogger.info({ length: webpages.length }, "webpages count");
  for (const webpage of webpages) {
    myLogger.info({ webpage }, "processing webpage");
    const job = await processWebpageQueue.add("processWebpage", {
      webpage,
    });
    myLogger.info({ id: job.id, webpage }, "scheduled job to process Webpage");
  }
  return webpages.length;
};

export default processAllExistingWebpages;

if (require.main === module) {
  (async () => {
    await processAllExistingWebpages("clhtwckif000098wp207rs2fg");
  })();
}
