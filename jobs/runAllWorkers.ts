import createAdvertisementWorker from "./workers/createAdvertisementWorker";
import createScoredCampaignWorker from "./workers/createScoredCampaignWorker";
import downloadWebpagesWorker from "./workers/downloadWebpagesWorker";
import processAllUsersWorker from "./workers/processAllUsersWorker";
import processCampaignWorker from "./workers/processCampaignWorker";
import processUserWorker from "./workers/processUserWorker";
import processWebpageWorker from "./workers/processWebpageWorker";
import processWebsiteWorker from "./workers/processWebsiteWorker";
import processWebpagesWithZeroAdsWorker from "./workers/processWebpagesWithZeroAdsWorker";
import setupCronJobs from "./setupCronJobs";
import logger from "@/lib/logger";

(async () => {
  logger.info({}, "starting workers");
  createAdvertisementWorker.run();
  createScoredCampaignWorker.run();
  downloadWebpagesWorker.run();
  processAllUsersWorker.run();
  processCampaignWorker.run();
  processUserWorker.run();
  processWebpageWorker.run();
  processWebsiteWorker.run();
  processWebpagesWithZeroAdsWorker.run();
  logger.info({}, "finished starting workers");

  logger.info({}, "starting to add cron jobs");
  if(process.env.NODE_ENV !== "development"){
    await setupCronJobs();
  }else{
   logger.info({}, "skipping as we are in development")
  }
  logger.info({}, "finished to add cron jobs");
})();

process.on("SIGINT", async () => {
  logger.info({}, "started graceful shutdown");

  setTimeout(() => {
    logger.error({}, "exiting abruptly as workers wont shutdown");
    process.exit(0);
  }, 2000);

  await createAdvertisementWorker.close();
  logger.info({}, "closed – createAdvertisementWorker");
  await createScoredCampaignWorker.close();
  logger.info({}, "closed – createScoredCampaignWorker");
  await downloadWebpagesWorker.close();
  logger.info({}, "closed – downloadWebpagesWorker");
  await processAllUsersWorker.close();
  logger.info({}, "closed – processAllUsersWorker");
  await processCampaignWorker.close();
  logger.info({}, "closed – processCampaignWorker");
  await processUserWorker.close();
  logger.info({}, "closed – processUserWorker");
  await processWebpageWorker.close();
  logger.info({}, "closed – processWebpageWorker");
  await processWebsiteWorker.close();
  logger.info({}, "closed – processWebsiteWorker");
  await processWebpagesWithZeroAdsWorker.close();
  logger.info({}, "closed – processWebpagesWithZeroAdsWorker");

  logger.info({}, "finished doing graceful shutdown");
  process.exit(0);
});

process.on("uncaughtException", function (err) {
  logger.error({ err }, "runAllWorkers process got uncaughtException");
});

process.on("unhandledRejection", (reason, promise) => {
  logger.error(
    { promise, reason },
    "runAllWorkers process got Unhandled Rejection"
  );
});
