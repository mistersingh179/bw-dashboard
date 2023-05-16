import prisma from "@/lib/prisma";
import {Campaign, Webpage} from "@prisma/client";

type GetCampaignsWhichNeedScore = (webpage: Webpage) => Promise<Campaign[]>;

const getCampaignsWhichNeedScore: GetCampaignsWhichNeedScore = async (webpage) => {
  console.log("in getCampaignsWhichNeedScore with webpage: ", webpage.id);

  const user = await prisma.user.findFirstOrThrow({
    where: {
      websites: {
        some: {
          webpages: {
            some: {
              id: webpage.id
            }
          }
        }
      }
    },
  });
  console.log("user: ", user);

  const existingScoredCampaigns = await prisma.scoredCampaign.findMany({
    where: {
      webpageId: webpage.id,
    },
  });
  console.log("existingScoredCampaigns: ", existingScoredCampaigns);

  const existingScoredCampaignsIds = existingScoredCampaigns.map(
    (c) => c.campaignId
  );
  console.log("existingScoredCampaignsIds: ", existingScoredCampaignsIds);

  const campaignsWhichNeedScore = await prisma.campaign.findMany({
    where: {
      userId: user.id,
      id: {
        notIn: existingScoredCampaignsIds,
      },
    },
  });
  console.log("campaignsWhichNeedScore: ", campaignsWhichNeedScore);
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
