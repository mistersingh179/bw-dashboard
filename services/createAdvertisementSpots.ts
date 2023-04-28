import {
  Advertisement,
  Prisma,
  RelevantCampaign,
  WebsiteUrl,
} from "@prisma/client";
import prisma from "@/lib/prisma";
import getAdvertisementText from "@/services/prompts/getAdvertisementText";
import AdvertisementCreateManyInput = Prisma.AdvertisementCreateManyInput;
import AdvertisementCreateManyRelevantCampaignInput = Prisma.AdvertisementCreateManyRelevantCampaignInput;
import getAdSpotsForWebpage, {
  nextWithText,
} from "@/services/helpers/getAdSpotsForWebpage";
import AdvertisementSpotCreateManyWebsiteUrlInput = Prisma.AdvertisementSpotCreateManyWebsiteUrlInput;

const createAdvertisementSpots = async (websiteUrl: WebsiteUrl) => {
  console.log("in createAdvertisementSpots for: ", websiteUrl);

  const spotsExist = Boolean(
    await prisma.advertisementSpot.findFirst({
      where: {
        websiteUrlId: websiteUrl.id
      },
      select: {
        id: true,
      },
    })
  );
  if (spotsExist) {
    console.log(`Aborting createAdvertisementSpots as we already have them`);
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
