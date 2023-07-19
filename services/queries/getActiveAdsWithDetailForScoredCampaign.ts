import logger from "@/lib/logger";
import { AdWithDetail } from "@/services/queries/getAdvertisementsForUrl";
import prisma from "@/lib/prisma";

type GetActiveAdsWithDetailForScoredCampaign = (
  scoredCampaignId: string,
) => Promise<AdWithDetail[]>;

const getActiveAdsWithDetailForScoredCampaign: GetActiveAdsWithDetailForScoredCampaign =
  async (scoredCampaignId) => {
    const myLogger = logger.child({
      name: "getActiveAdsWithDetailForScoredCampaign",
      scoredCampaignId,
    });

    myLogger.info({}, "started service");
    const adsWithDetail: AdWithDetail[] = await prisma.advertisement.findMany({
      where: {
        scoredCampaignId: scoredCampaignId,
        status: true,
      },
      include: {
        advertisementSpot: true,
        scoredCampaign: {
          include: {
            campaign: true,
          },
        },
      },
    });
    myLogger.info({ adsWithDetail }, "finished service");
    return adsWithDetail;
  };

export default getActiveAdsWithDetailForScoredCampaign;

if (require.main === module) {
  (async () => {
    const scoredCampaign = await prisma.scoredCampaign.findFirstOrThrow({
      where: {
        webpageId: "clk9r8fj800049889eu3qpvxt",
      },
    });
    await getActiveAdsWithDetailForScoredCampaign(scoredCampaign.id);
  })();
}
