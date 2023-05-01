import {Prisma, WebsiteUrl} from "@prisma/client";
import prisma from "@/lib/prisma";
import getAdSpotsForWebpage from "@/services/helpers/getAdSpotsForWebpage";
import AdvertisementSpotCreateManyWebsiteUrlInput = Prisma.AdvertisementSpotCreateManyWebsiteUrlInput;
import {DESIRED_ADVERTISEMENT_SPOT_COUNT} from "@/constants";

const enoughAdSpotsExist = async (websiteUrl: WebsiteUrl): Promise<boolean> => {
  const result = await prisma.advertisementSpot.findMany({
    where: {
      websiteUrlId: websiteUrl.id,
    },
    select: {
      id: true,
    },
    take: DESIRED_ADVERTISEMENT_SPOT_COUNT,
  });
  return result.length === DESIRED_ADVERTISEMENT_SPOT_COUNT;
};

type CreateAdvertisementSpots = (websiteUrl: WebsiteUrl) => Promise<void>;

const createAdvertisementSpots: CreateAdvertisementSpots = async (websiteUrl) => {
  console.log("in createAdvertisementSpots for: ", websiteUrl);

  if (await enoughAdSpotsExist(websiteUrl)) {
    console.log(`Aborting createAdvertisementSpots as we already enough`);
    return;
  }

  const adSpotTextArr = await getAdSpotsForWebpage(websiteUrl);

  const advertisementSpotInputs: AdvertisementSpotCreateManyWebsiteUrlInput[] =
    adSpotTextArr.map((item) => ({
      beforeText: item.beforeText,
      afterText: item.afterText,
    }));

  await prisma.websiteUrl.update({
    where: {
      id: websiteUrl.id,
    },
    data: {
      advertisementSpots: {
        createMany: {
          data: advertisementSpotInputs,
        },
      },
    },
  });
};

export default createAdvertisementSpots;

if (require.main === module) {
  (async () => {
    const wu = await prisma.websiteUrl.findFirstOrThrow();
    createAdvertisementSpots(wu);
  })();
}
