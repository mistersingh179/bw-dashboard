import logger from "@/lib/logger";
import prisma from "@/lib/prisma";
import { Prisma, ScoredCampaign } from "@prisma/client";
import BatchPayload = Prisma.BatchPayload;

type SetScoredCampaignBest = (
  scoredCampaignId: string,
  webpageId: string,
) => Promise<BatchPayload[]>;

const setScoredCampaignBest: SetScoredCampaignBest = async (scoredCampaignId, webpageId) => {
  const myLogger = logger.child({
    name: "setScoredCampaignBest",
    scoredCampaignId,
    webpageId,
  });

  myLogger.info({}, "started service");

  const setItAsBest = prisma.scoredCampaign.updateMany({
    where: {
      id: scoredCampaignId,
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
        not: scoredCampaignId
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
    const scoredCampaign = await prisma.scoredCampaign.findFirstOrThrow({
      where: {
        id: "clk9r8fr1000398iifsb29wae",
      },
    });
    await setScoredCampaignBest(scoredCampaign.id, scoredCampaign.webpageId);
  })();
}
