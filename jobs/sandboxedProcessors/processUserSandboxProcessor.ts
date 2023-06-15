import { SandboxedJob } from "bullmq";
import processUser from "@/services/processUser";
import { ProcessUserDataType } from "@/jobs/dataTypes";

export default async function (job: SandboxedJob<ProcessUserDataType, void>) {
  const { user, settings } = job.data;
  await processUser(user, settings);
}
