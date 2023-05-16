import { DESIRED_ADVERTISEMENT_COUNT } from "@/constants";
import { AdvertisementSpot, Prisma, ScoredCampaign } from "@prisma/client";
import prisma from "@/lib/prisma";
import AdvertisementCreateManyAdvertisementSpotInput = Prisma.AdvertisementCreateManyAdvertisementSpotInput;
import extractCleanedWebpageText from "@/services/helpers/extractCleanedWebpageText";
import getAdvertisementText from "@/services/prompts/getAdvertisementText";

const enoughActiveAdsExist = async (
  advertisementSpot: AdvertisementSpot,
  scoredCampaign: ScoredCampaign
): Promise<boolean> => {
  const result = await prisma.advertisement.findMany({
    where: {
      advertisementSpotId: advertisementSpot.id,
      scoredCampaignId: scoredCampaign.id,
      status: true,
    },
    select: {
      id: true,
    },
    take: DESIRED_ADVERTISEMENT_COUNT,
  });
  return result.length === DESIRED_ADVERTISEMENT_COUNT;
};

type CreateAdvertisement = (
  advertisementSpot: AdvertisementSpot,
  scoredCampaign: ScoredCampaign
) => Promise<void>;

const createAdvertisement: CreateAdvertisement = async (
  advertisementSpot,
  scoredCampaign
) => {
  console.log(
    "will create advertisement(s) for spot ",
    advertisementSpot.id,
    "and scored campaign ",
    scoredCampaign.id
  );

  if (await enoughActiveAdsExist(advertisementSpot, scoredCampaign)) {
    console.log("Aborting as we have enough advertisements");
    return;
  }

  const webpage = await prisma.webpage.findFirstOrThrow({
    where: {
      id: advertisementSpot.webpageId,
      content: {
        isNot: null,
      },
    },
    include: {
      content: true,
    },
  });

  if (webpage.content === null) {
    console.log("Aborting as we dont have any content for the website");
    return;
  }

  const webpageText = extractCleanedWebpageText(webpage.content.desktopHtml);

  const { beforeText, afterText } = advertisementSpot;

  const campaign = await prisma.campaign.findFirstOrThrow({
    where: {
      id: scoredCampaign.campaignId,
    },
  });

  const { productName, productDescription } = campaign;

  const adTextCopies = await getAdvertisementText(
    webpageText,
    beforeText,
    afterText,
    productName,
    productDescription
  );

  const advertisementInputArr: AdvertisementCreateManyAdvertisementSpotInput[] =
    adTextCopies.map((adTextCopy) => ({
      advertText: adTextCopy,
      scoredCampaignId: scoredCampaign.id,
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
};

export default createAdvertisement;

if (require.main === module) {
  (async () => {
    const webpage = await prisma.webpage.findFirstOrThrow({
      where: {
        id: "clh9d58tw000098c05nhdmbql",
      },
      include: {
        advertisementSpots: true,
        scoredCampaigns: true,
      },
    });
    console.log(
      "webpage: ",
      webpage.url,
      webpage.advertisementSpots.length,
      webpage.scoredCampaigns.length
    );
    for (const as of webpage.advertisementSpots) {
      for (const sc of webpage.scoredCampaigns) {
        await createAdvertisement(as, sc);
      }
    }
  })();
}
