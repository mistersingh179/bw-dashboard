import { SandboxedJob } from "bullmq";
import createAdvertisement from "@/services/createAdvertisement";
import { CreateAdvertisementDataType } from "@/jobs/dataTypes";

export default async function (
  job: SandboxedJob<CreateAdvertisementDataType, void>
) {
  console.log("createAdvertisementWorker", job.name, job.id);
  const { advertisementSpot, scoredCampaign, settings } = job.data;
  await createAdvertisement(advertisementSpot, scoredCampaign, settings);
}
