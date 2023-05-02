import prisma from "@/lib/prisma";
import getCampaignsWhichNeedScore from "@/services/helpers/getCampaignsWhichNeedScore";
import { Prisma, Webpage } from "@prisma/client";
import getCampaignsWithTheirScores from "@/services/prompts/getCampaignsWithTheirScores";
import ScoredCampaignCreateManyWebpageInput = Prisma.ScoredCampaignCreateManyWebpageInput;

type CreateScoredCampaigns = (webpage: Webpage) => Promise<void>;

const createScoredCampaigns: CreateScoredCampaigns = async (webpage) => {
  console.log("webpage: ", webpage);
  const campaignsWhichNeedScore = await getCampaignsWhichNeedScore(webpage);
  const campaignsWithScore = await getCampaignsWithTheirScores(
    webpage,
    campaignsWhichNeedScore
  );

  const scoredCampaignInput: ScoredCampaignCreateManyWebpageInput[] =
    campaignsWithScore.map((c) => {
      return {
        campaignId: c.id,
        score: c.score,
        reason: c.reason,
      };
    });
  console.log("input to create scored campaigns: ", scoredCampaignInput);

  await prisma.webpage.update({
    where: {
      id: webpage.id,
    },
    data: {
      scoredCampaigns: {
        createMany: {
          data: scoredCampaignInput,
        },
      },
    },
  });
};

if (require.main === module) {
  (async () => {
    const webpage = await prisma.webpage.findFirstOrThrow();
    await createScoredCampaigns(webpage);
  })();
}

export default createScoredCampaigns;
