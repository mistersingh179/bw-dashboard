import { SandboxedJob } from "bullmq";
import downloadWebpages from "@/services/downloadWebpages";
import { DownloadWebpagesDataType } from "@/jobs/dataTypes";

export default async function (
  job: SandboxedJob<DownloadWebpagesDataType, void>
) {
  console.log("downloadWebpagesWorker", job.name, job.id);
  const { website, settings, sitemapUrl } = job.data;
  await downloadWebpages(website, settings, sitemapUrl);
}
