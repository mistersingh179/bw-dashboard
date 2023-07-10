import logger from "@/lib/logger";
import { startOfDay, startOfYesterday } from "date-fns";
import prisma from "@/lib/prisma";

const myLogger = logger.child({ name: "getMostVisitedUrls" });

type GetMostVisitedUrls = (
  userId: string,
  howMany: number,
  since?: Date
) => Promise<string[]>;

const getMostVisitedUrls: GetMostVisitedUrls = async (
  userId,
  howMany,
  since
) => {
  myLogger.info({ userId, howMany, since }, "inside service");
  const result = await prisma.auction.groupBy({
    by: ["url"],
    where: {
      userId: userId,
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
  myLogger.info({result, userId, howMany, since }, "query result of most visited urls");
  const urls = result.map((x) => x.url ?? "").filter((x) => x);
  return urls;
};

export default getMostVisitedUrls;

if (require.main === module) {
  (async () => {
    const allTime = await getMostVisitedUrls("clijnsj8p01pskz08xjo9cq4g", 5);
    myLogger.info({ allTime }, "all time");

    const yesterday = startOfYesterday();
    const forYesterday = await getMostVisitedUrls(
      "clijnsj8p01pskz08xjo9cq4g",
      2,
      yesterday
    );
    myLogger.info({ forYesterday }, "forYesterday");
  })();
}
