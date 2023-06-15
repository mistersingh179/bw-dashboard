import { config } from "dotenv";
import Redis from "ioredis";
import logger from "@/lib/logger";

const result = config({ debug: true });
if (result.error) {
  logger.error({ err: result.error }, "UNABLE to parse .ENV file!!!");
}

const { REDIS_HOST } = process.env;
const REDIS_PORT = Number(process.env.REDIS_PORT) || 0;
const REDIS_URL = String(process.env.REDIS_URL) ?? "";

logger.info({REDIS_URL, REDIS_HOST, REDIS_PORT}, "Redis ENV variables")

export const redisClient = new Redis(REDIS_URL, {
  maxRetriesPerRequest: null,
  enableReadyCheck: false,
  retryStrategy: function (times: number) {
    return Math.max(Math.min(Math.exp(times), 20000), 1000);
  },
});

// this prevents node warning which comes from many workers adding listeners to the same redis connection
redisClient.setMaxListeners(100);

export default redisClient;
