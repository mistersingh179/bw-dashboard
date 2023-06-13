import { SandboxedJob } from "bullmq";
import processCampaign from "@/services/processCampaign";
import { ProcessCampaignDataType } from "@/jobs/dataTypes";

export default async function (
  job: SandboxedJob<ProcessCampaignDataType, void>
) {
  console.log("processCampaignWorker", job.name, job.id);
  const { campaign } = job.data;
  await processCampaign(campaign);
}
