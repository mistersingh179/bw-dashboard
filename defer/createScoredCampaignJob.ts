import { defer, awaitResult } from "@defer/client";
import processUser from "@/services/processUser";
import { Content, User, Webpage } from ".prisma/client";
import createContent from "@/services/createContent";
import createScoredCampaigns from "@/services/createScoredCampaigns";
import { Campaign, Setting } from "@prisma/client";

const createScoredCampaignJob = async (
  webpage: Webpage,
  content: Content,
  settings: Setting,
  user: User,
  campaigns: Campaign[]
) => {
  console.log("started createScoredCampaignJob with: ", webpage.url);
  await createScoredCampaigns(webpage, content, settings, user, campaigns);
  console.log("finished createScoredCampaignJob with: ", webpage.url);
};

export default defer(createScoredCampaignJob, {
  retry: 1,
  concurrency: 10,
});
