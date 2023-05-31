import { defer, awaitResult } from "@defer/client";
import processUser from "@/services/processUser";
import { User, Webpage } from ".prisma/client";
import createContent from "@/services/createContent";
import { AdvertisementSpot, ScoredCampaign, Setting } from "@prisma/client";
import createAdvertisement from "@/services/createAdvertisement";

const createAdvertisementJob = async (
  advertisementSpot: AdvertisementSpot,
  scoredCampaign: ScoredCampaign,
  settings: Setting
) => {
  console.log("started createAdvertisementJob with: ", advertisementSpot.id, scoredCampaign.id, settings.id);
  await createAdvertisement(advertisementSpot, scoredCampaign, settings);
  console.log("finished createAdvertisementJob with: ", advertisementSpot.id, scoredCampaign.id, settings.id);
};

export default defer(createAdvertisementJob, {
  retry: 1,
  concurrency: 20,
});
