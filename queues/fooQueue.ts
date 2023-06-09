import {Queue, QueueEvents} from "bullmq";
import redisClient from "@/lib/redisClient";

export const fooQueue = new Queue("foo", {
  connection: redisClient,
  defaultJobOptions: {
    removeOnComplete: 1000,
    removeOnFail: 5000,
  },
});

fooQueue.on("error", (err) => {
  console.log("there is an error on fooQueue: ", err)
})

export const fooQueueEvents = new QueueEvents("foo", {
  connection: redisClient,
});

export default fooQueue;