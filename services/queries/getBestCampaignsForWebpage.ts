import logger from "@/lib/logger";
import prisma from "@/lib/prisma";
import getCampaignsWhoHaveNotMetImpCap from "@/services/queries/getCamapignsWhoHaveNotMetImpCap";
import {Campaign, ScoredCampaign} from "@prisma/client";

type GetBestCampaignsForWebpage = (
  webpageId: string,
  userScoreThreshold: number,
  campaignsWhoHaveNotMetImpCap: string[],
  webpageCategoryNames: string[],
  howMany: number
) => Promise< ScoredCampaign[]>;

const getBestCampaignsForWebpage: GetBestCampaignsForWebpage = async (
  webpageId,
  userScoreThreshold,
  campaignsWhoHaveNotMetImpCap,
  webpageCategoryNames,
  howMany
) => {
  const myLogger = logger.child({
    name: "getBestCampaignForWebpage",
    webpageId,
    userScoreThreshold,
    campaignsWhoHaveNotMetImpCap,
    webpageCategoryNames,
  });

  myLogger.info({}, "inside service");

  const now = new Date();
  const bestScoredCampaigns = await prisma.scoredCampaign.findMany({
    where: {
      webpageId,
      score: {
        gte: userScoreThreshold,
      },
      campaign: {
        id: {
          in: campaignsWhoHaveNotMetImpCap,
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
                  in: webpageCategoryNames,
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
    },
    orderBy: [
      {
        score: "desc",
      },
      {
        campaign: {
          fixedCpm: "desc",
        },
      },
      {
        campaign: {
          createdAt: "asc",
        },
      },
    ],
    take: howMany,
  });
  myLogger.info({ bestScoredCampaigns }, "finishing service");
  return bestScoredCampaigns;
};

export default getBestCampaignsForWebpage;

if (require.main === module) {
  (async () => {
    const webpage = await prisma.webpage.findFirstOrThrow({
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
        categories: true,
      },
    });

    const campaignsWhoHaveNotMetImpCap = (
      await getCampaignsWhoHaveNotMetImpCap(webpage.website.user.id)
    ).map((c) => c.id);

    const webpageCategoryNames = webpage?.categories.map((c) => c.name) ?? [];

    const bestCampaign = await getBestCampaignsForWebpage(
      webpage.id,
      webpage.website.user.setting!.scoreThreshold,
      campaignsWhoHaveNotMetImpCap,
      webpageCategoryNames,
      webpage.website.user.setting!.bestCampaignCount,
    );

    logger.info({ bestCampaign }, "***ans: ");
  })();
}
