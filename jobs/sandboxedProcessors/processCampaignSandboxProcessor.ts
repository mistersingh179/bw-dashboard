import { SandboxedJob } from "bullmq";
import processCampaign from "@/services/processCampaign";
import { ProcessCampaignDataType } from "@/jobs/dataTypes";

export default async function (
  job: SandboxedJob<ProcessCampaignDataType, void>
) {
  const { campaign } = job.data;
  await processCampaign(campaign);
}
