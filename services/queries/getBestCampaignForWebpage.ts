import logger from "@/lib/logger";
import prisma from "@/lib/prisma";
import getCampaignsWhoHaveNotMetImpCap from "@/services/queries/getCamapignsWhoHaveNotMetImpCap";
import {Campaign, ScoredCampaign} from "@prisma/client";

type GetBestCampaignForWebpage = (
  webpageId: string,
  userScoreThreshold: number,
  campaignsWhoHaveNotMetImpCap: string[],
  webpageCategoryNames: string[]
) => Promise< ScoredCampaign | null>;

const getBestCampaignForWebpage: GetBestCampaignForWebpage = async (
  webpageId,
  userScoreThreshold,
  campaignsWhoHaveNotMetImpCap,
  webpageCategoryNames
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
  const bestScoredCampaign = await prisma.scoredCampaign.findFirst({
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
    take: 1,
  });
  myLogger.info({ bestScoredCampaign }, "finishing service");
  return bestScoredCampaign;
};

export default getBestCampaignForWebpage;

if (require.main === module) {
  (async () => {
    const webpage = await prisma.webpage.findFirstOrThrow({
      where: {
        id: "clk8fuyh1000298f90v8nbkks",
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

    const bestCampaign = await getBestCampaignForWebpage(
      webpage.id,
      webpage.website.user.setting!.scoreThreshold,
      campaignsWhoHaveNotMetImpCap,
      webpageCategoryNames
    );

    logger.info({ bestCampaign }, "***ans: ");
  })();
}
