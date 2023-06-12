import { config } from "dotenv";
config();
console.log("NODE_ENV: ", process.env.NODE_ENV);

import createAdvertisementWorker from "./workers/createAdvertisementWorker";
import createScoredCampaignWorker from "./workers/createScoredCampaignWorker";
import downloadWebpagesWorker from "./workers/downloadWebpagesWorker";
import processAllUsersWorker from "./workers/processAllUsersWorker";
import processCampaignWorker from "./workers/processCampaignWorker";
import processUserWorker from "./workers/processUserWorker";
import processWebpageWorker from "./workers/processWebpageWorker";
import processWebsiteWorker from "./workers/processWebsiteWorker";
import setupCronJobs from "./setupCronJobs";

import processAllUsersQueue from "@/jobs/queues/processAllUsersQueue";

(async () => {
  console.log("starting workers");
  createAdvertisementWorker.run();
  createScoredCampaignWorker.run();
  downloadWebpagesWorker.run();
  processAllUsersWorker.run();
  processCampaignWorker.run();
  processUserWorker.run();
  processWebpageWorker.run();
  processWebsiteWorker.run();
  console.log("finished starting workers");

  console.log("starting to add cron jobs")
  await setupCronJobs();
  console.log("finished to add cron jobs")
})();

process.on("SIGINT", async () => {
  console.log("started graceful shutdown");

  setTimeout(() => {
    console.log("exiting abruptly as workers wont shutdown")
    process.exit(0);
  }, 2000);

  await createAdvertisementWorker.close();
  console.log("closed – createAdvertisementWorker");
  await createScoredCampaignWorker.close();
  console.log("closed – createScoredCampaignWorker");
  await downloadWebpagesWorker.close();
  console.log("closed – downloadWebpagesWorker");
  await processAllUsersWorker.close();
  console.log("closed – processAllUsersWorker");
  await processCampaignWorker.close();
  console.log("closed – processCampaignWorker");
  await processUserWorker.close();
  console.log("closed – processUserWorker");
  await processWebpageWorker.close();
  console.log("closed – processWebpageWorker");
  await processWebsiteWorker.close();
  console.log("closed – processWebsiteWorker");

  console.log("finished doing graceful shutdown");
  process.exit(0);
});

process.on("uncaughtException", function (err) {
  console.log("Uncaught exception: ", err);
});

process.on("unhandledRejection", (reason, promise) => {
  console.error("Unhandled Rejection at: Promise: ", { promise, reason });
});
