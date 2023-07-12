import logger from "@/lib/logger";
import { startOfDay, startOfYesterday } from "date-fns";
import prisma from "@/lib/prisma";

const myLogger = logger.child({ name: "getMostVisitedUrls" });

type GetMostVisitedUrls = (
  websiteId: string,
  howMany: number,
  since?: Date
) => Promise<string[]>;

const getMostVisitedUrls: GetMostVisitedUrls = async (
  websiteId,
  howMany,
  since
) => {
  myLogger.info({ websiteId, howMany, since }, "inside service");
  const result = await prisma.auction.groupBy({
    by: ["url"],
    where: {
      websiteId: websiteId,
      createdAt: {
        gte: since,
      },
    },
    _count: {
      id: true,
    },
    orderBy: {
      _count: {
        id: "desc",
      },
    },
    take: howMany,
  });
  myLogger.info({result, websiteId, howMany, since }, "query result of most visited urls");
  const urls = result.map((x) => x.url ?? "").filter((x) => x);
  return urls;
};

export default getMostVisitedUrls;

if (require.main === module) {
  (async () => {
    const allTime = await getMostVisitedUrls("cljztbiak0041981caa3hgdaa", 5);
    myLogger.info({ allTime }, "all time");

    // const yesterday = startOfYesterday();
    // const forYesterday = await getMostVisitedUrls(
    //   "cljyf33m3001h981c0luk5pfj",
    //   2,
    //   yesterday
    // );
    // myLogger.info({ forYesterday }, "forYesterday");
  })();
}
