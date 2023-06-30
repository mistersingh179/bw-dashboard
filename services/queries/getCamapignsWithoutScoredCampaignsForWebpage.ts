import prisma from "@/lib/prisma";
import AnyObject from "@/types/AnyObject";
import { Campaign } from "@prisma/client";
import logger from "@/lib/logger";

const myLogger = logger.child({
  name: "getCampaignsWithoutScoredCampaignsForWebpage",
});

type GetCampaignsWithoutScoredCampaignsForWebpage = (
  wpid: string
) => Promise<Campaign[]>;

const getCampaignsWithoutScoredCampaignsForWebpage: GetCampaignsWithoutScoredCampaignsForWebpage =
  async (wpid) => {
    myLogger.info({ wpid }, "starting service");
    const campaigns = await prisma.campaign.findMany({
      where: {
        user: {
          websites: {
            some: {
              webpages: {
                some: {
                  id: wpid,
                },
              },
            },
          },
        },
        scoredCampaigns: {
          none: {
            webpageId: wpid,
          },
        },
      },
    });
    return campaigns;
  };

export default getCampaignsWithoutScoredCampaignsForWebpage;

if (require.main === module) {
  (async () => {
    const ans = await getCampaignsWithoutScoredCampaignsForWebpage(
      "clh9d58tw000198c0g5kfluac"
    );
    console.log(ans);
  })();
}
