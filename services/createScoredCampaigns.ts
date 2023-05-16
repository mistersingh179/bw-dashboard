import prisma from "@/lib/prisma";
import { Prisma, Webpage } from "@prisma/client";
import getCampaignsWithTheirScores from "@/services/prompts/getCampaignsWithTheirScores";
import ScoredCampaignCreateManyWebpageInput = Prisma.ScoredCampaignCreateManyWebpageInput;
import getCampaignsWithoutScoredCampaignsForWebpage from "@/services/queries/getCamapignsWithoutScoredCampaignsForWebpage";

type CreateScoredCampaigns = (webpage: Webpage) => Promise<void>;

const createScoredCampaigns: CreateScoredCampaigns = async (webpage) => {
  console.log("webpage: ", webpage.id, webpage.url);

  const campaignsWhichNeedScore =
    await getCampaignsWithoutScoredCampaignsForWebpage(webpage.id);
  if(campaignsWhichNeedScore.length == 0){
    console.log('aborting createScoredCampaigns as all campaigns are already scored');
    return;
  }

  const campaignsWithScore = await getCampaignsWithTheirScores(webpage);

  const scoredCampaignInput: ScoredCampaignCreateManyWebpageInput[] =
    campaignsWithScore.map((c) => {
      return {
        campaignId: c.id,
        score: c.scoreAsNum ?? 0,
        reason: c.reason ?? "",
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
          skipDuplicates: true,
        },
      },
    },
  });
};

if (require.main === module) {
  (async () => {
    const webpage = await prisma.webpage.findFirstOrThrow({
      where: {
        id: "clh9d58tw000198c0g5kfluac",
      },
    });
    await createScoredCampaigns(webpage);
  })();
}

export default createScoredCampaigns;
