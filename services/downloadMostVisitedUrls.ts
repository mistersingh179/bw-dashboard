import logger from "@/lib/logger";

const myLogger = logger.child({name: "downloadMostVisitedUrls"});

type DownloadMostVisitedUrls = () => Promise<void>;

const downloadMostVisitedUrls: DownloadMostVisitedUrls = async () => {
  myLogger.info({}, "inside service");
};

export default downloadMostVisitedUrls;

if (require.main === module) {
  (async () => {
    await downloadMostVisitedUrls();
  })();
}
