import { SandboxedJob } from "bullmq";
import processAllUsers from "@/services/processAllUsers";

export default async function (job: SandboxedJob<void, void>) {
  console.log("processAllUsersWorker", job.name, job.id);
  await processAllUsers();
}
