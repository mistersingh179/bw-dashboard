import { SandboxedJob } from "bullmq";
import createScoredCampaigns from "@/services/createScoredCampaigns";
import { CreateScoredCampaignDataType } from "@/jobs/dataTypes";

export default async function (
  job: SandboxedJob<CreateScoredCampaignDataType, void>
) {
  const { webpage, content, settings, user, campaigns } = job.data;
  await createScoredCampaigns(webpage, content, settings, user, campaigns);
}
