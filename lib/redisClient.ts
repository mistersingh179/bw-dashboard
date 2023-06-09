import { config } from "dotenv";
import Redis from "ioredis";

config();

const { REDIS_HOST } = process.env;
const REDIS_PORT = Number(process.env.REDIS_PORT) || 0;
const REDIS_URL = String(process.env.REDIS_URL) ?? "";

console.log("REDIS_URL: ", REDIS_URL);
console.log("REDIS_HOST: ", REDIS_HOST);
console.log("REDIS_PORT: ", REDIS_PORT);

export const redisClient = new Redis(REDIS_URL, {
  maxRetriesPerRequest: null,
  enableReadyCheck: false,
  retryStrategy: function (times: number) {
    return Math.max(Math.min(Math.exp(times), 20000), 1000);
  }
});

export default redisClient