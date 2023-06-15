import { SandboxedJob } from "bullmq";
import processWebpage from "@/services/processWebpage";
import { ProcessWebpageDataType } from "@/jobs/dataTypes";

export default async function (
  job: SandboxedJob<ProcessWebpageDataType, void>
) {
  const { webpage } = job.data;
  await processWebpage(webpage);
}
