import { SandboxedJob } from "bullmq";
import processWebpagesWithZeroAds from "@/services/processWebpagesWithZeroAds";

export default async function (job: SandboxedJob<void, void>) {
  await processWebpagesWithZeroAds();
}
