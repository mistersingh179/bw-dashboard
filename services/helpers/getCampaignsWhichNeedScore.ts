import prisma from "@/lib/prisma";
import { WebsiteUrl } from "@prisma/client";

// todo - should have type to declare return as its any right now

const getCampaignsWhichNeedScore = async (websiteUrl: WebsiteUrl) => {
  console.log("in getCampaignsWhichNeedScore with websiteUrl: ", websiteUrl.id);

  const user = await prisma.user.findFirstOrThrow({
    where: {
      id: websiteUrl.userId,
    },
  });
  console.log("user: ", user);

  const existingScoredCampaigns = await prisma.scoredCampaign.findMany({
    where: {
      websiteUrlId: websiteUrl.id,
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
    const websiteUrl = await prisma.websiteUrl.findFirstOrThrow({
      where: {
        id: "clgv42xj5000l98yf73ocppzq",
      },
    });
    await getCampaignsWhichNeedScore(websiteUrl);
  })();
}

export default getCampaignsWhichNeedScore;
