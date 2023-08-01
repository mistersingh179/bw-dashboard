import logger from "@/lib/logger";
import prisma from "@/lib/prisma";
import { Prisma, ScoredCampaign } from "@prisma/client";
import BatchPayload = Prisma.BatchPayload;

type SetScoredCampaignBest = (
  scoredCampaignIds: string[],
  webpageId: string
) => Promise<BatchPayload[]>;

const setScoredCampaignBest: SetScoredCampaignBest = async (
  scoredCampaignIds,
  webpageId
) => {
  const myLogger = logger.child({
    name: "setScoredCampaignBest",
    scoredCampaignIds,
    webpageId,
  });

  myLogger.info({}, "started service");

  const setItAsBest = prisma.scoredCampaign.updateMany({
    where: {
      id: {
        in: scoredCampaignIds,
      },
      isBest: false,
    },
    data: {
      isBest: true,
    },
  });

  const setOthersAsNotBest = prisma.scoredCampaign.updateMany({
    where: {
      webpageId: webpageId,
      isBest: true,
      id: {
        not: {
          in: scoredCampaignIds,
        },
      },
    },
    data: {
      isBest: false,
    },
  });

  const result = await prisma.$transaction([setItAsBest, setOthersAsNotBest]);

  myLogger.info({ result }, "finished service");
  return result;
};

export default setScoredCampaignBest;

if (require.main === module) {
  (async () => {
    const scoredCampaigns = await prisma.scoredCampaign.findMany({
      where: {
        id: {
          in: ["clksdathc007n98c3bzss25nm", "clksdc4xt008498c31bzy96n6"],
          // in: ["clkrey0rg006l98c3lwdctvd2"],
        },
      },
    });
    await setScoredCampaignBest(
      scoredCampaigns.map((x) => x.id),
      scoredCampaigns[0].webpageId
    );
  })();
}
