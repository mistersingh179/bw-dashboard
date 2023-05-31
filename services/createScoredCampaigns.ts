import prisma from "@/lib/prisma";
import { Prisma, Webpage } from "@prisma/client";
import getCampaignsWithTheirScores, {CampaignProductWithScore} from "@/services/prompts/getCampaignsWithTheirScores";
import ScoredCampaignCreateManyWebpageInput = Prisma.ScoredCampaignCreateManyWebpageInput;
import getCampaignsWithoutScoredCampaignsForWebpage from "@/services/queries/getCamapignsWithoutScoredCampaignsForWebpage";

type CreateScoredCampaigns = (webpage: Webpage) => Promise<void>;

const createScoredCampaigns: CreateScoredCampaigns = async (webpage) => {
  console.log("started createScoredCampaigns with: ",webpage.url);

  const campaignsWhichNeedScore =
    await getCampaignsWithoutScoredCampaignsForWebpage(webpage.id);
  if (campaignsWhichNeedScore.length == 0) {
    console.log(
      "aborting createScoredCampaigns as all campaigns are already scored"
    );
    return;
  }

  let campaignsWithScore: CampaignProductWithScore[] = [];
  try {
    campaignsWithScore = await getCampaignsWithTheirScores(webpage);
  } catch (err) {
    console.log("aborting as unable to get campaign scores");
    return;
  }

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
        id: "cli38233j000098m9ug7e78m7",
      },
    });
    await createScoredCampaigns(webpage);
  })();
}

export default createScoredCampaigns;
