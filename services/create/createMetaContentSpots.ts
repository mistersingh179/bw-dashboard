import { Prisma, Setting, Webpage } from "@prisma/client";
import prisma from "@/lib/prisma";
import MetaContentSpotCreateManyWebpageInput = Prisma.MetaContentSpotCreateManyWebpageInput;
import { Content } from ".prisma/client";
import logger from "@/lib/logger";
import getMetaContentSpotsForWebpage from "@/services/helpers/getMetaContentSpotsForWebpage";

type CreateMetaContentSpots = (
  webpage: Webpage,
  content: Content,
  settings: Setting
) => Promise<void>;

const createMetaContentSpots: CreateMetaContentSpots = async (
  webpage,
  content,
  settings
) => {
  const myLogger = logger.child({
    name: "createMetaContentSpots",
    webpage,
  });

  myLogger.info({}, "starting service");

  const { desiredMetaContentSpotCount, metaContentStatus } = settings;

  // if (metaContentStatus === false) {
  //   myLogger.info(
  //     { metaContentStatus },
  //     "Aborting as meta content status is turned off."
  //   );
  //   return;
  // }

  const existingMetaContentSpotCount = await prisma.metaContentSpot.count({
    where: {
      webpageId: webpage.id,
    },
  });

  // todo - need to also not process webpages for which we have processed in past and were unable to create the spots
  // todo - this will not stop & thus we will re-process a webpage which just doesnt have enough spots
  // todo - will not remove meta content spots if we have too many

  if (existingMetaContentSpotCount >= desiredMetaContentSpotCount) {
    myLogger.info(
      { existingMetaContentSpotCount, desiredMetaContentSpotCount },
      "Aborting as we already enough meta content spots"
    );
    return;
  }

  const metaContentSpotTextArr = await getMetaContentSpotsForWebpage(
    webpage,
    content,
    settings
  );

  if (metaContentSpotTextArr.length === 0) {
    myLogger.info({}, "Aborting as unable to get ad spots");
    return;
  }

  const metaContentSpotInputs: MetaContentSpotCreateManyWebpageInput[] =
    metaContentSpotTextArr.map((contentText) => ({
      contentText,
    }));

  await prisma.webpage.update({
    where: {
      id: webpage.id,
    },
    data: {
      metaContentSpots: {
        createMany: {
          data: metaContentSpotInputs,
          skipDuplicates: true,
        },
      },
    },
  });
};

export default createMetaContentSpots;

if (require.main === module) {
  (async () => {
    const wp = await prisma.webpage.findFirstOrThrow({
      where: {
        id: "clkrey0jx000m985gb765ieg0",
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
            metaContentSpots: true,
            scoredCampaigns: true,
          },
        },
      },
    });
    const content = wp.content!;
    const setting = wp.website.user.setting!;
    wp.content = null;
    wp.website = null!;

    await createMetaContentSpots(wp, content, setting);
  })();
}
