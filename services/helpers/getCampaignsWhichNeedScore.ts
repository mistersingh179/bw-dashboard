import prisma from "@/lib/prisma";
import {Campaign, Webpage} from "@prisma/client";

// todo - should have type to declare return as its any right now
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
        id: "clgv42xj5000l98yf73ocppzq",
      },
    });
    await getCampaignsWhichNeedScore(webpage);
  })();
}

export default getCampaignsWhichNeedScore;
