import { config } from "dotenv";
import Redis from "ioredis";

const result = config({ debug: true });
if (result.error) {
  throw result.error;
}

const { REDIS_HOST } = process.env;
const REDIS_PORT = Number(process.env.REDIS_PORT) || 0;
const REDIS_URL = String(process.env.REDIS_URL) ?? "";

console.log("REDIS_URL: ", REDIS_URL);
console.log("REDIS_HOST: ", REDIS_HOST);
console.log("REDIS_PORT: ", REDIS_PORT);

const DATABASE_URL = String(process.env.DATABASE_URL) ?? "";
console.log("DATABASE_URL: ", DATABASE_URL);

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
