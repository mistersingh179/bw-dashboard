import { Campaign } from "@prisma/client";
import prisma from "@/lib/prisma";
import processWebpageQueue from "@/jobs/queues/processWebpageQueue";
import logger from "@/lib/logger";

const myLogger = logger.child({ name: "processCampaign" });

type ProcessCampaign = (campaign: Campaign) => Promise<void>;

const processCampaign: ProcessCampaign = async (campaign) => {
  myLogger.info({ name: campaign.name }, "started service");
  const webpages = await prisma.webpage.findMany({
    where: {
      website: {
        user: {
          campaigns: {
            some: {
              id: campaign.id,
            },
          },
        },
      },
    },
  });
  for (const wp of webpages) {
    const job = await processWebpageQueue.add("processWebpage", {
      webpage: wp,
    });
    myLogger.info({id: job.id, url: wp.url}, "scheduled job to process webpage")
  }
};

export default processCampaign;

if (require.main === module) {
  (async () => {
    const campaign = await prisma.campaign.findFirstOrThrow({
      where: {
        id: "clig8qup0001w98twqrylwu82",
      },
    });
    await processCampaign(campaign);
  })();
}
