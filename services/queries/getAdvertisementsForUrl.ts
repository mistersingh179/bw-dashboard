import prisma from "@/lib/prisma";
import { Advertisement, AdvertisementSpot, Setting } from "@prisma/client";
import { Category, User } from ".prisma/client";

type AdWithAdSpot = Advertisement & { advertisementSpot: AdvertisementSpot };
type AdLookupParamsForUrl = {
  origin: string;
  originWithPathName: string;
  userId: string;
  userScoreThreshold: number;
  alreadyDeliveredImpressionsCount: number;
  categoriesOfWebpage: string[];
};
type GetAdvertisementsForUrl = (
  lookupParams: AdLookupParamsForUrl
) => Promise<AdWithAdSpot[]>;

const getAdvertisementsForUrl: GetAdvertisementsForUrl = async (
  lookupParams
) => {

  const now = new Date();
  const {
    origin,
    originWithPathName,
    userId,
    userScoreThreshold,
    alreadyDeliveredImpressionsCount,
    categoriesOfWebpage,
  } = lookupParams;

  console.dir({ ...lookupParams, now });

  const advertisements = await prisma.advertisement.findMany({
    where: {
      status: true,
      advertisementSpot: {
        webpage: {
          status: true,
          url: originWithPathName,
          website: {
            status: true,
            topLevelDomainUrl: origin,
            user: {
              id: userId,
              setting: {
                status: true,
              },
            },
          },
        },
      },
      scoredCampaign: {
        score: {
          gt: userScoreThreshold,
        },
        campaign: {
          status: true,
          start: {
            lte: now,
          },
          end: {
            gt: now,
          },
          impressionCap: {
            gt: alreadyDeliveredImpressionsCount,
          },
          categories: {
            some: {
              name: {
                in: categoriesOfWebpage,
              },
            },
          },
        },
      },
    },
    include: {
      advertisementSpot: true,
    },
  });

  return advertisements;
};

export default getAdvertisementsForUrl;

if (require.main === module) {
  (async () => {
    const ans = await getAdvertisementsForUrl({
      origin: "https://www.simplyrecipes.com",
      originWithPathName: "https://www.simplyrecipes.com/recipes/peppermint_meringue_cookies/",
      alreadyDeliveredImpressionsCount: 5,
      categoriesOfWebpage: ["sr_dessert-recipes"],
      userScoreThreshold: 0,
      userId: "clhtwckif000098wp207rs2fg"
    });
    console.log("ans: ", ans);
  })();
}
