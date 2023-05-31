import { defer, awaitResult } from "@defer/client";
import processUser from "@/services/processUser";
import {User, Webpage} from ".prisma/client";
import createContent from "@/services/createContent";
import createScoredCampaigns from "@/services/createScoredCampaigns";

const createScoredCampaignJob = async (webpage: Webpage) => {
  console.log("started createScoredCampaignJob with: ", webpage.url);
  await createScoredCampaigns(webpage);
  console.log("finished createScoredCampaignJob with: ", webpage.url);
};

export default defer(createScoredCampaignJob, {
  retry: 1,
  concurrency: 20,
});
