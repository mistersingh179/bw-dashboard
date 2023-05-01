import prisma from "@/lib/prisma";
import getCampaignsWhichNeedScore from "@/services/helpers/getCampaignsWhichNeedScore";
import { Prisma, WebsiteUrl } from "@prisma/client";
import getCampaignsWithTheirScores from "@/services/prompts/getCampaignsWithTheirScores";
import ScoredCampaignCreateManyWebsiteUrlInput = Prisma.ScoredCampaignCreateManyWebsiteUrlInput;

type CreateScoredCampaigns = (websiteUrl: WebsiteUrl) => Promise<void>;

const createScoredCampaigns: CreateScoredCampaigns = async (websiteUrl) => {
  console.log("websiteUrl: ", websiteUrl);
  const campaignsWhichNeedScore = await getCampaignsWhichNeedScore(websiteUrl);
  const campaignsWithScore = await getCampaignsWithTheirScores(
    websiteUrl,
    campaignsWhichNeedScore
  );

  const scoredCampaignInput: ScoredCampaignCreateManyWebsiteUrlInput[] =
    campaignsWithScore.map((c) => {
      return {
        campaignId: c.id,
        score: c.score,
        reason: c.reason,
      };
    });
  console.log("input to create scored campaigns: ", scoredCampaignInput);

  await prisma.websiteUrl.update({
    where: {
      id: websiteUrl.id,
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
    const websiteUrl = await prisma.websiteUrl.findFirstOrThrow();
    await createScoredCampaigns(websiteUrl);
  })();
}

export default createScoredCampaigns;
