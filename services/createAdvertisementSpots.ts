import { Prisma, Setting, Webpage } from "@prisma/client";
import prisma from "@/lib/prisma";
import getAdSpotsForWebpage from "@/services/helpers/getAdSpotsForWebpage";
import AdvertisementSpotCreateManyWebpageInput = Prisma.AdvertisementSpotCreateManyWebpageInput;
import { Content, User } from ".prisma/client";
import logger from "@/lib/logger";

// const enoughAdSpotsExist = async (webpage: Webpage, settings: Setting): Promise<boolean> => {
//   const result = await prisma.advertisementSpot.findMany({
//     where: {
//       webpageId: webpage.id,
//     },
//     select: {
//       id: true,
//     },
//     take:  settings.desiredAdvertisementSpotCount,
//   });
//   return result.length === settings.desiredAdvertisementSpotCount;
// };

const myLogger = logger.child({ name: "createAdvertisementSpots" });

type CreateAdvertisementSpots = (
  webpage: Webpage,
  content: Content,
  settings: Setting
) => Promise<void>;

const createAdvertisementSpots: CreateAdvertisementSpots = async (
  webpage,
  content,
  settings
) => {
  myLogger.info({ webpage }, "starting service");

  // if (await enoughAdSpotsExist(webpage)) {
  //   console.log(`Aborting createAdvertisementSpots as we already enough`);
  //   return;
  // }

  const existingAdSpotCount = await prisma.advertisementSpot.count({
    where: {
      webpageId: webpage.id,
    },
  });

  // todo - need to also not process webpages for which we have processed in past and were unable to create the spots
  // todo - this will not stop & thus we will re-process a webpage which just doesnt have enough spots

  const { desiredAdvertisementSpotCount } = settings;

  if (existingAdSpotCount >= desiredAdvertisementSpotCount) {
    myLogger.info(
      { existingAdSpotCount, desiredAdvertisementSpotCount },
      "Aborting as we already enough spots"
    );
    return;
  }

  const adSpotTextArr = await getAdSpotsForWebpage(webpage, content, settings);

  if (adSpotTextArr.length === 0) {
    myLogger.info({}, "Aborting as unable to get ad spots")
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
        id: "cli38233j000098m9ug7e78m7",
      },
      include: {
        website: {
          include: {
            user: {
              include: {
                setting: true,
              },
            },
          },
        },
        content: true,
        _count: {
          select: {
            categories: true,
            advertisementSpots: true,
            scoredCampaigns: true,
          },
        },
      },
    });
    await createAdvertisementSpots(wp, wp.content!, wp.website.user.setting!);
  })();
}
