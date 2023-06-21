import prisma from "@/lib/prisma";
import { Campaign, Prisma, Setting } from "@prisma/client";
import getCampaignsWithTheirScores, {
  CampaignProductWithScore,
} from "@/services/prompts/getCampaignsWithTheirScores";
import { Content, User, Webpage } from ".prisma/client";
import ScoredCampaignCreateManyWebpageInput = Prisma.ScoredCampaignCreateManyWebpageInput;
import logger from "@/lib/logger";

const myLogger = logger.child({ name: "createScoredCampaigns" });

type CreateScoredCampaigns = (
  webpage: Webpage,
  content: Content,
  settings: Setting,
  user: User,
  campaigns: Campaign[]
) => Promise<void>;

const createScoredCampaigns: CreateScoredCampaigns = async (
  webpage,
  content,
  settings,
  user,
  campaigns
) => {
  myLogger.info(
    { url: webpage.url, email: user.email, length: campaigns.length },
    "started service"
  );

  // const campaignsWhichNeedScore =
  //   await getCampaignsWithoutScoredCampaignsForWebpage(webpage.id);
  // if (campaignsWhichNeedScore.length == 0) {
  //   console.log(
  //     "aborting createScoredCampaigns as all campaigns are already scored"
  //   );
  //   return;
  // }

  const existingScoredCampaignsCount = await prisma.scoredCampaign.count({
    where: {
      webpageId: webpage.id,
    },
  });

  if (existingScoredCampaignsCount >= campaigns.length) {
    myLogger.info({}, "aborting as all campaigns are already scored");
    return;
  }

  let campaignsWithScore: CampaignProductWithScore[] = [];
  try {
    campaignsWithScore = await getCampaignsWithTheirScores(
      webpage,
      campaigns,
      content,
      settings,
    );
  } catch (err) {
    myLogger.error({ err }, "aborting as unable to get campaign scores");
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
  myLogger.info({scoredCampaignInput}, "input to create scored campaigns")

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
      include: {
        website: {
          include: {
            user: {
              include: {
                setting: true,
                campaigns: true,
              },
            },
          },
        },
        content: true,
      },
    });
    await createScoredCampaigns(
      webpage,
      webpage.content!,
      webpage.website.user.setting!,
      webpage.website.user,
      webpage.website.user.campaigns
    );
  })();
}

export default createScoredCampaigns;
