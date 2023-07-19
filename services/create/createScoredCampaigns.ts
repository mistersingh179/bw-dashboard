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
) => Promise<CampaignProductWithScore[] | null>;

const createScoredCampaigns: CreateScoredCampaigns = async (
  webpage,
  content,
  settings,
  user,
  campaigns
) => {
  myLogger.info({ webpage, user, campaigns }, "starting service");

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
    myLogger.info(
      { webpage, campaigns, existingScoredCampaignsCount },
      "aborting as all campaigns are already scored"
    );
    return [];
  }

  let campaignsWithScore: CampaignProductWithScore[] = [];
  try {
    campaignsWithScore = await getCampaignsWithTheirScores(
      webpage,
      campaigns,
      content,
      settings
    );
  } catch (err) {
    myLogger.error(
      { webpage, campaigns, err },
      "aborting as unable to get campaign scores"
    );
    return null;
  }

  const scoredCampaignInput: ScoredCampaignCreateManyWebpageInput[] =
    campaignsWithScore.map((c) => {
      return {
        campaignId: c.id,
        score: c.scoreAsNum ?? 0,
        reason: c.reason ?? "",
      };
    });
  myLogger.info({ webpage, scoredCampaignInput }, "input to create scored campaigns");

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

  return campaignsWithScore;
};

if (require.main === module) {
  (async () => {
    const webpage = await prisma.webpage.findFirstOrThrow({
      where: {
        id: "cljhmc6mb004doo21i8x5513c",
      },
    });
    const content = await prisma.content.findFirstOrThrow({
      where: {
        webpageId: webpage.id,
      },
    });
    const website = await prisma.website.findFirstOrThrow({
      where: {
        id: webpage.websiteId,
      },
      include: {
        user: {
          include: {
            setting: true,
            campaigns: true,
          },
        },
      },
    });
    await createScoredCampaigns(
      webpage,
      content,
      website.user.setting!,
      website.user,
      website.user.campaigns
    );
  })();
}

export default createScoredCampaigns;
