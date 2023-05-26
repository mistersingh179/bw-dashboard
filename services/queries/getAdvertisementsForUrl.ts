import prisma from "@/lib/prisma";
import {
  Advertisement,
  AdvertisementSpot,
  Campaign,
  ScoredCampaign,
} from "@prisma/client";

type AdWithDetail = Advertisement & {
  advertisementSpot: AdvertisementSpot;
  scoredCampaign: ScoredCampaign & { campaign: Campaign };
};

// type AdWithAdSpot =  Advertisement & {advertisementSpot: AdvertisementSpot, scoredCampaign: ScoredCampaign & {campaign: Campaign}};
type AdLookupParamsForUrl = {
  origin: string;
  originWithPathName: string;
  userId: string;
  userScoreThreshold: number;
  categoriesOfWebpage: string[];
  campIdsWhoHaveNotMetImpCap: string[];
};
type GetAdvertisementsForUrl = (
  lookupParams: AdLookupParamsForUrl
) => Promise<AdWithDetail[]>;

const getAdvertisementsForUrl: GetAdvertisementsForUrl = async (
  lookupParams
) => {
  const now = new Date();
  const {
    origin,
    originWithPathName,
    userId,
    userScoreThreshold,
    categoriesOfWebpage,
    campIdsWhoHaveNotMetImpCap,
  } = lookupParams;

  console.dir({ ...lookupParams, now });

  const advertisements = await prisma.advertisement.findMany({
    where: {
      advertisementSpot: {
        webpage: {
          website: {
            user: {
              id: userId,
              setting: {
                status: true,
              },
            },
            topLevelDomainUrl: origin,
            status: true,
          },
          url: originWithPathName,
          status: true,
        },
      },
      scoredCampaign: {
        campaign: {
          id: {
            in: campIdsWhoHaveNotMetImpCap,
          },
          start: {
            lte: now,
          },
          end: {
            gt: now,
          },
          status: true,
          OR: [
            {
              categories: {
                some: {
                  name: {
                    in: categoriesOfWebpage,
                  },
                },
              },
            },
            {
              categories: {
                none: {}
              }
            }
          ],
        },
        score: {
          gt: userScoreThreshold,
        },
      },
      status: true,
    },
    include: {
      advertisementSpot: true,
      scoredCampaign: {
        include: {
          campaign: true,
        },
      },
    },
    orderBy: [
      {
        scoredCampaign: {
          campaign: {
            fixedCpm: "desc",
          },
        },
      },
      {
        scoredCampaign: {
          score: "desc",
        },
      },
    ],
    distinct: ["advertisementSpotId"],
  });

  return advertisements;
};

export default getAdvertisementsForUrl;

if (require.main === module) {
  (async () => {
    const ans = await getAdvertisementsForUrl({
      origin: "http://localhost:8000",
      originWithPathName: "http://localhost:8000/simplyrecipes.html",
      categoriesOfWebpage: ["sr_table-talk"],
      userScoreThreshold: 0,
      userId: "clhtwckif000098wp207rs2fg",
      campIdsWhoHaveNotMetImpCap: [
        "clhtx8jj2000i98wp09vkdc1i",
        "clhxf3s28000098s7816uadue",
        "cli4mmxdg0002982qp1tnkzs2",
      ],
    });
    console.log("ans: ", ans.length);
    console.log(ans.map((a) => a.scoredCampaign.campaign.name));
  })();
}
