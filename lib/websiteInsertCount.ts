import { Website } from ".prisma/client";
import redisClient from "@/lib/redisClient";
import prisma from "@/lib/prisma";
import logger from "@/lib/logger";

const myLogger = logger.child({ name: "websiteInsertCount" });

const keyBuilder = (website: Website) => {
  return `websiteInsertCount:${website.id}`;
};

const getWebsiteInsertCount = async (website: Website) => {
  const key = keyBuilder(website);
  const count = await redisClient.get(key);
  if (count === null) {
    throw new Error(`website insert count not found – ${key}`);
  }
  myLogger.info({ key, count }, "got website insert count");
  return Number(count);
};

const setWebsiteInsertCount = async (website: Website, count: number) => {
  const key = keyBuilder(website);
  await redisClient.set(key, count);
  myLogger.info({ key, count }, "set website insert count");
};

const incrementWebsiteInsertCount = async (
  website: Website,
  amount: number
) => {
  const key = keyBuilder(website);
  await redisClient.incrby(key, amount);
  myLogger.info({ key, amount }, "incremented website insert count");
};

export {
  getWebsiteInsertCount,
  setWebsiteInsertCount,
  incrementWebsiteInsertCount,
};

(async () => {
  if (require.main == module) {
    const ws = await prisma.website.findFirstOrThrow({
      where: {
        id: "cliuhtdc4000v98ul85yvnzm5",
      },
    });
    await setWebsiteInsertCount(ws, 200);
    let ans = await getWebsiteInsertCount(ws);
    console.log(ans);
    await incrementWebsiteInsertCount(ws, 5);
    ans = await getWebsiteInsertCount(ws);
    console.log(ans);
    ans = await getWebsiteInsertCount(ws);
    console.log(ans);
  }
})();
