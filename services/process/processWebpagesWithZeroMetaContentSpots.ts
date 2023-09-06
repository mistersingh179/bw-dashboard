import logger from "@/lib/logger";
import prisma from "@/lib/prisma";
import processWebpageQueue from "@/jobs/queues/processWebpageQueue";
import postOnSlack from "@/lib/postOnSlack";

const myLogger = logger.child({ name: "processWebpagesWithZeroMetaContentSpots" });

export type WebsiteUrlToCount = {
  [key: string]: number;
};
type ProcessWebpagesWithZeroMetaContentSpots = () => Promise<WebsiteUrlToCount>;

const processWebpagesWithZeroMetaContentSpots: ProcessWebpagesWithZeroMetaContentSpots = async () => {
  myLogger.info({}, "inside service");
  let result: WebsiteUrlToCount = {};

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
      const webpages = await prisma.webpage.findMany({
        where: {
          metaContentSpots: {
            none: {},
          },
        },
      });

      myLogger.info(
        {
          length: webpages.length,
          email: user.email,
          domain: website.topLevelDomainUrl,
        },
        "number of webpages with zero meta content spots"
      );
      if (webpages.length > 0) {
        result[website.topLevelDomainUrl] = webpages.length;
      }
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
  await postOnSlack("Webpages With Zero Meta Content Spots", result);
  return result;
};

export default processWebpagesWithZeroMetaContentSpots;

if (require.main === module) {
  (async () => {
    await processWebpagesWithZeroMetaContentSpots();
  })();
}
