import prisma from "@/lib/prisma";
import getCampaignsWhichNeedScore from "@/services/getCampaignsWhichNeedScore";
import {Prisma, RelevantCampaign, WebsiteUrl} from "@prisma/client";
import addBrandRelevanceScore from "@/services/addBrandRelevanceScore";
import RelevantCampaignCreateManyWebsiteUrlInput = Prisma.RelevantCampaignCreateManyWebsiteUrlInput;

const buildRelevantCampaigns = async (websiteUrl: WebsiteUrl) => {
  console.log("websiteUrl: ", websiteUrl);
  const campaignsWhichNeedScore = await getCampaignsWhichNeedScore(websiteUrl);
  const campaignsWithScore = await addBrandRelevanceScore(
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
    await buildRelevantCampaigns(websiteUrl);
  })();
}

export default buildRelevantCampaigns;
