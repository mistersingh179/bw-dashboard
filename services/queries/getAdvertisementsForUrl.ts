import prisma from "@/lib/prisma";
import {
  Advertisement,
  AdvertisementSpot,
  Campaign,
  ScoredCampaign,
} from "@prisma/client";
import logger from "@/lib/logger";

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

const myLogger = logger.child({ name: "getAdvertisementsForUrl" });

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

  myLogger.info({ ...lookupParams, now }, "stared service");

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
                none: {},
              },
            },
          ],
        },
        score: {
          gte: userScoreThreshold,
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
  myLogger.info({ length: advertisements.length }, "got advertisements");

  return advertisements;
};

export default getAdvertisementsForUrl;

if (require.main === module) {
  (async () => {
    const ans = await getAdvertisementsForUrl({
      origin: "https://brandweaver.ai",
      originWithPathName:
        "https://brandweaver.ai/blog/intro-to-solidity-a-simple-hello-world-smart-contract-ethereum-developer-tutorial-for-beginners",
      categoriesOfWebpage: [""],
      userScoreThreshold: 1,
      userId: "clij1cjb60000mb08uzganxdq",
      campIdsWhoHaveNotMetImpCap: [
        "clij1mvw40000mt08img8o3i0",
        "clij1k23i0000mf08trz34qst",
        "clij1la530002mf08vusrtoul",
      ],
    });
    console.log("***ans: ", ans.length);
    console.log(ans.map((a) => a.scoredCampaign.campaign.name));
  })();
}
