import { Campaign, WebsiteUrl } from "@prisma/client";
import prisma from "@/lib/prisma";

type CampaignWithScore = Campaign & { score: number };

const addBrandRelevanceScore = async (
  websiteUrl: WebsiteUrl,
  campaigns: Campaign[]
) => {
  console.log("in addBrandRelevanceScore with: ", websiteUrl, campaigns);
  // TODO – call openai chatgpt here
  const campaignsWithScore: CampaignWithScore[] = campaigns.map((c) => {
    return {
      ...c,
      score: Math.round(Math.random() * 10),
    };
  });
  console.log("return with campaings with scores: ", campaignsWithScore);
  return campaignsWithScore;
};

if (require.main === module) {
  (async () => {
    const websiteUrl = await prisma.websiteUrl.findFirstOrThrow({
      where: {
        id: "clgv42xj5000l98yf73ocppzq",
      },
    });
    const campaignsWhichNeedScore = await prisma.campaign.findMany({
      where: {
        id: {
          in: ["clgwjd7m60000988y59jiaj5q", "clgwjejg70002988ycw5u06qa"],
        },
      },
    });
    const campaignsWithScore = await addBrandRelevanceScore(websiteUrl,campaignsWhichNeedScore);
    console.log("campaignsWithScore: ", campaignsWithScore);
  })();
}

export default addBrandRelevanceScore;
