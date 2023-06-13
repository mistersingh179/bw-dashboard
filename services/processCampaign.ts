import { Campaign } from "@prisma/client";
import prisma from "@/lib/prisma";
import processWebpageQueue from "@/jobs/queues/processWebpageQueue";

type ProcessCampaign = (campaign: Campaign) => Promise<void>;

const processCampaign: ProcessCampaign = async (campaign) => {
  console.log("inside service: processCampaign");
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
    console.log(`schedule job: ${job.id} for wp: ${wp.url}`);
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
