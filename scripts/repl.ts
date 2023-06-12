import prisma from "@/lib/prisma";
import createAdvertisementQueue from "@/jobs/queues/createAdvertisementQueue";
import redisClient from "@/lib/redisClient";

(async () => {
  console.log(Object.keys(redisClient));
})();

export {};
