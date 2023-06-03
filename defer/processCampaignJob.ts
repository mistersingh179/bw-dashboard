import { defer } from "@defer/client";
import processCampaign from "@/services/processCampaign";
import { Campaign } from ".prisma/client";

const processCampaignJob = async (campaign: Campaign) => {
  console.log("started processCampaignJob with: ", campaign.name);
  await processCampaign(campaign);
  console.log("finished processCampaignJob with: ", campaign.name);
};

export default defer(processCampaignJob, {
  retry: 1,
  concurrency: 20,
});
