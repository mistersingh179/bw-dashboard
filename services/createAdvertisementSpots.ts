import {Prisma, Setting, Webpage} from "@prisma/client";
import prisma from "@/lib/prisma";
import getAdSpotsForWebpage from "@/services/helpers/getAdSpotsForWebpage";
import AdvertisementSpotCreateManyWebpageInput = Prisma.AdvertisementSpotCreateManyWebpageInput;

const enoughAdSpotsExist = async (webpage: Webpage, settings: Setting): Promise<boolean> => {
  const result = await prisma.advertisementSpot.findMany({
    where: {
      webpageId: webpage.id,
    },
    select: {
      id: true,
    },
    take:  settings.desiredAdvertisementSpotCount,
  });
  return result.length === settings.desiredAdvertisementSpotCount;
};

type CreateAdvertisementSpots = (webpage: Webpage, settings: Setting) => Promise<void>;

const createAdvertisementSpots: CreateAdvertisementSpots = async (webpage, settings) => {
  console.log("in createAdvertisementSpots for: ", webpage.url);

  if (await enoughAdSpotsExist(webpage, settings)) {
    console.log(`Aborting createAdvertisementSpots as we already enough`);
    return;
  }

  const adSpotTextArr = await getAdSpotsForWebpage(webpage, settings);

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
        id: "cli38233j000098m9ug7e78m7",
      },
      include: {
        website: {
          include: {
            user: {
              include: {
                setting: true
              }
            }
          }
        }
      }
    });
    await createAdvertisementSpots(wp, wp.website.user.setting!);
  })();
}
