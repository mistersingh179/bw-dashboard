import { SandboxedJob } from "bullmq";
import processAllUsers from "@/services/processAllUsers";

export default async function (job: SandboxedJob<void, void>) {
  await processAllUsers();
}
