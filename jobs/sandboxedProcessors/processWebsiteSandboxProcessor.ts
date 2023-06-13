import { SandboxedJob } from "bullmq";
import processWebsite from "@/services/processWebsite";
import { ProcessWebsiteDataType } from "@/jobs/dataTypes";

export default async function (
  job: SandboxedJob<ProcessWebsiteDataType, void>
) {
  console.log("processWebsiteWorker", job.name, job.id);
  const { website, settings } = job.data;
  await processWebsite(website, settings);
}
