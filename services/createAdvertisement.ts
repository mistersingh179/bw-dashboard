import { DESIRED_ADVERTISEMENT_COUNT } from "@/constants";
import { AdvertisementSpot, Prisma } from "@prisma/client";
import prisma from "@/lib/prisma";
import getAdvertisementText from "@/services/prompts/getAdvertisementText";
import AdvertisementCreateManyAdvertisementSpotInput = Prisma.AdvertisementCreateManyAdvertisementSpotInput;

const enoughActiveAdsExist = async (
  advertisementSpot: AdvertisementSpot
): Promise<boolean> => {
  const result = await prisma.advertisement.findMany({
    where: {
      advertisementSpotId: advertisementSpot.id,
      status: true,
    },
    select: {
      id: true,
    },
    take: DESIRED_ADVERTISEMENT_COUNT,
  });
  return result.length === DESIRED_ADVERTISEMENT_COUNT;
};

const createAdvertisement = async (advertisementSpot: AdvertisementSpot) => {
  console.log("will create advertisement(s) for spot: ", advertisementSpot);

  if (await enoughActiveAdsExist(advertisementSpot)) {
    console.log("Aborting as we have enough advertisements");
    return;
  }

  const existingAdvertisementSpot =
    await prisma.advertisementSpot.findFirstOrThrow({
      where: {
        id: advertisementSpot.id,
      },
      include: {
        websiteUrl: {
          include: {
            scoredCampaigns: {
              include: {
                campaign: true,
              },
            },
          },
        },
      },
    });

  const { beforeText, afterText } = existingAdvertisementSpot;
  const { corpus } = existingAdvertisementSpot.websiteUrl;
  const { scoredCampaigns } = existingAdvertisementSpot.websiteUrl;

  for (const sc of scoredCampaigns) {
    const { productName, productDescription } = sc.campaign;
    const adTextCopies = await getAdvertisementText(
      corpus,
      beforeText,
      afterText,
      productName,
      productDescription
    );
    const advertisementInputArr: AdvertisementCreateManyAdvertisementSpotInput[] =
      adTextCopies.map((adTextCopy) => ({
        advertText: adTextCopy,
        scoredCampaignId: sc.id,
        status: true,
      }));

    await prisma.advertisementSpot.update({
      where: {
        id: advertisementSpot.id,
      },
      data: {
        advertisements: {
          createMany: { data: advertisementInputArr },
        },
      },
    });
  }
};

export default createAdvertisement;

if (require.main === module) {
  (async () => {
    const websiteUrl = await prisma.websiteUrl.findFirstOrThrow({
      include: {
        advertisementSpots: true,
      },
    });
    for (const as of websiteUrl.advertisementSpots) {
      await createAdvertisement(as);
    }
  })();
}
