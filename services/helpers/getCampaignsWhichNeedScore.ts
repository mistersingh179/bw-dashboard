import prisma from "@/lib/prisma";
import { Campaign, Webpage } from "@prisma/client";
import logger from "@/lib/logger";

const myLogger = logger.child({ name: "getCampaignsWhichNeedScore" });

type GetCampaignsWhichNeedScore = (webpage: Webpage) => Promise<Campaign[]>;

const getCampaignsWhichNeedScore: GetCampaignsWhichNeedScore = async (
  webpage
) => {
  myLogger.info({ url: webpage.url }, "starting service");

  const user = await prisma.user.findFirstOrThrow({
    where: {
      websites: {
        some: {
          webpages: {
            some: {
              id: webpage.id,
            },
          },
        },
      },
    },
  });
  myLogger.info({ user }, "got user");

  const existingScoredCampaigns = await prisma.scoredCampaign.findMany({
    where: {
      webpageId: webpage.id,
    },
  });
  myLogger.info({ existingScoredCampaigns }, "existingScoredCampaigns");

  const existingScoredCampaignsIds = existingScoredCampaigns.map(
    (c) => c.campaignId
  );
  myLogger.info({ existingScoredCampaignsIds }, "existingScoredCampaignsIds");

  const campaignsWhichNeedScore = await prisma.campaign.findMany({
    where: {
      userId: user.id,
      id: {
        notIn: existingScoredCampaignsIds,
      },
    },
  });
  myLogger.info({ campaignsWhichNeedScore }, "campaignsWhichNeedScore");
  return campaignsWhichNeedScore;
};

if (require.main === module) {
  (async () => {
    const webpage = await prisma.webpage.findFirstOrThrow({
      where: {
        id: "clh9d58tw000198c0g5kfluac",
      },
    });
    const ans = await getCampaignsWhichNeedScore(webpage);
    console.log("*** ans: ", ans);
  })();
}

export default getCampaignsWhichNeedScore;
