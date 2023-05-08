import { Prisma, Webpage } from "@prisma/client";
import prisma from "@/lib/prisma";
import getAdSpotsForWebpage from "@/services/helpers/getAdSpotsForWebpage";
import AdvertisementSpotCreateManyWebpageInput = Prisma.AdvertisementSpotCreateManyWebpageInput;
import { DESIRED_ADVERTISEMENT_SPOT_COUNT } from "@/constants";

const enoughAdSpotsExist = async (webpage: Webpage): Promise<boolean> => {
  const result = await prisma.advertisementSpot.findMany({
    where: {
      webpageId: webpage.id,
    },
    select: {
      id: true,
    },
    take: DESIRED_ADVERTISEMENT_SPOT_COUNT,
  });
  return result.length === DESIRED_ADVERTISEMENT_SPOT_COUNT;
};

type CreateAdvertisementSpots = (webpage: Webpage) => Promise<void>;

const createAdvertisementSpots: CreateAdvertisementSpots = async (webpage) => {
  console.log("in createAdvertisementSpots for: ", webpage.id);

  if (await enoughAdSpotsExist(webpage)) {
    console.log(`Aborting createAdvertisementSpots as we already enough`);
    return;
  }

  const adSpotTextArr = await getAdSpotsForWebpage(webpage);

  if (adSpotTextArr.length === 0) {
    console.log("Aborting createAdvertisementSpots as unable to get ad spots");
    return;
  }

  const advertisementSpotInputs: AdvertisementSpotCreateManyWebpageInput[] =
    adSpotTextArr.map((item) => ({
      beforeText: item.beforeText,
      afterText: item.afterText,
    }));

  await prisma.webpage.update({
    where: {
      id: webpage.id,
    },
    data: {
      advertisementSpots: {
        createMany: {
          data: advertisementSpotInputs,
          skipDuplicates: true,
        },
      },
    },
  });
};

export default createAdvertisementSpots;

if (require.main === module) {
  (async () => {
    const wp = await prisma.webpage.findFirstOrThrow({
      where: {
        id: "clh6eip82001298kw3dmr4idj",
      },
    });
    await createAdvertisementSpots(wp);
  })();
}
