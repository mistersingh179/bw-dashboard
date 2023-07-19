import {
  AdvertisementSpot,
  Prisma,
  ScoredCampaign,
  Setting,
} from "@prisma/client";
import prisma from "@/lib/prisma";
import AdvertisementCreateManyAdvertisementSpotInput = Prisma.AdvertisementCreateManyAdvertisementSpotInput;
import extractCleanedWebpageText from "@/services/helpers/extractCleanedWebpageText";
import getAdvertisementText from "@/services/prompts/getAdvertisementText";
import logger from "@/lib/logger";
import { omit } from "lodash";

const enoughActiveAdsExist = async (
  advertisementSpot: AdvertisementSpot,
  scoredCampaign: ScoredCampaign,
  settings: Setting
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
    take: settings.desiredAdvertisementCount,
  });
  return result.length === settings.desiredAdvertisementCount;
};

type CreateAdvertisement = (
  advertisementSpot: AdvertisementSpot,
  scoredCampaign: ScoredCampaign,
  settings: Setting
) => Promise<string[] | null>;

const createAdvertisement: CreateAdvertisement = async (
  advertisementSpot,
  scoredCampaign,
  settings
) => {
  const webpage = await prisma.webpage.findFirst({
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

  const myLogger = logger.child({
    name: "createAdvertisement",
    scoredCampaign,
    advertisementSpot,
    webpage: omit(webpage, ["content"]),
  });

  myLogger.info({}, "starting service");

  if (webpage === null || webpage.content === null) {
    myLogger.error({}, "aborting as webpage content not found");
    return null;
  }

  if (await enoughActiveAdsExist(advertisementSpot, scoredCampaign, settings)) {
    myLogger.info({}, "Aborting as we already have enough advertisements");
    return [];
  }

  const webpageText = extractCleanedWebpageText(
    webpage.content.desktopHtml,
    200,
    settings.mainPostBodySelector
  );

  const { title, description } = webpage.content;

  const { beforeText, afterText } = advertisementSpot;

  const campaign = await prisma.campaign.findFirstOrThrow({
    where: {
      id: scoredCampaign.campaignId,
    },
  });

  const { productName, productDescription } = campaign;

  const { desiredAdvertisementCount } = settings;

  let adTextCopies: string[] = [];
  try {
    adTextCopies = await getAdvertisementText(
      webpageText,
      title,
      description,
      beforeText,
      afterText,
      productName,
      productDescription,
      desiredAdvertisementCount
    );
  } catch (err) {
    myLogger.error({ err }, "aborting as unable to get advertisement text");
    await prisma.scoredCampaign.update({
      where: {
        id: scoredCampaign.id,
      },
      data: {
        adBuildFailCount: {
          increment: 1
        }
      }
    })
    return null;
  }

  const advertisementInputArr: AdvertisementCreateManyAdvertisementSpotInput[] =
    adTextCopies.map((adTextCopy) => {
      adTextCopy = adTextCopy.split("\n")[0].trim();
      if (!adTextCopy.includes(productName)) {
        adTextCopy = adTextCopy + ` Visit ${productName}`;
      }
      return {
        advertText: adTextCopy,
        scoredCampaignId: scoredCampaign.id,
        status: true,
      };
    });

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

  return adTextCopies;
};

export default createAdvertisement;

if (require.main === module) {
  (async () => {
    const webpage = await prisma.webpage.findFirstOrThrow({
      where: {
        id: "cljztqwcp0021989kse957248",
      },
      include: {
        advertisementSpots: true,
        scoredCampaigns: true,
        website: {
          include: {
            user: {
              include: {
                setting: true,
              },
            },
          },
        },
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
        await createAdvertisement(as, sc, webpage.website.user.setting!);
      }
    }
  })();
}
