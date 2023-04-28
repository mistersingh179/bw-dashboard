import prisma from "@/lib/prisma";
import getCampaignsWhichNeedScore from "@/services/helpers/getCampaignsWhichNeedScore";
import { Prisma, WebsiteUrl } from "@prisma/client";
import getCampaignsWithTheirScores from "@/services/prompts/getCampaignsWithTheirScores";
import RelevantCampaignCreateManyWebsiteUrlInput = Prisma.RelevantCampaignCreateManyWebsiteUrlInput;

const createRelevantCampaigns = async (websiteUrl: WebsiteUrl) => {
  console.log("websiteUrl: ", websiteUrl);
  const campaignsWhichNeedScore = await getCampaignsWhichNeedScore(websiteUrl);
  const campaignsWithScore = await getCampaignsWithTheirScores(
    websiteUrl,
    campaignsWhichNeedScore
  );

  const relevantCampaignInput: RelevantCampaignCreateManyWebsiteUrlInput[] =
    campaignsWithScore.map((c) => {
      return {
        campaignId: c.id,
        score: c.score,
      };
    });
  console.log("input to create relevant campaigns: ", relevantCampaignInput);

  await prisma.websiteUrl.update({
    where: {
      id: websiteUrl.id,
    },
    data: {
      relevantCampaigns: {
        createMany: {
          data: relevantCampaignInput,
        },
      },
    },
  });
};

if (require.main === module) {
  (async () => {
    const websiteUrl = await prisma.websiteUrl.findFirstOrThrow({
      where: {
        id: "clgv42xj5000l98yf73ocppzq",
      },
    });
    await createRelevantCampaigns(websiteUrl);
  })();
}

export default createRelevantCampaigns;
