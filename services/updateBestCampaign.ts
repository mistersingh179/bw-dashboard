import logger from "@/lib/logger";
import { ScoredCampaign, Webpage } from "@prisma/client";
import prisma from "@/lib/prisma";
import setScoredCampaignBest from "@/services/queries/setScoredCampaignBest";
import setNoCampaignAsBest from "@/services/queries/setNoCampaignAsBest";

type UpdateBestCampaign = (
  webpage: Webpage,
  scoredCampaigns: ScoredCampaign[]
) => Promise<void>;

const updateBestCampaign: UpdateBestCampaign = async (
  webpage,
  scoredCampaigns
) => {
  const myLogger = logger.child({
    name: "updateBestCampaign",
    webpage,
    scoredCampaigns,
  });
  myLogger.info({ webpage, scoredCampaigns }, "started service");

  let result;
  if (scoredCampaigns.length > 0) {
    result = await setScoredCampaignBest(
      scoredCampaigns.map(sc => sc.id),
      webpage.id
    );
  } else if (scoredCampaigns.length == 0) {
    result = await setNoCampaignAsBest(webpage.id);
  }

  myLogger.info({ result }, "finished service");
};

export default updateBestCampaign;

if (require.main === module) {
  (async () => {
    const webpage = await prisma.webpage.findFirstOrThrow({
      where: {
        id: "clk9r8fj800049889eu3qpvxt",
      },
    });
    const scoredCampaigns = await prisma.scoredCampaign.findMany({
      where: {
        id: "clk9r8fr1000298ii0m1ifqkb",
      },
    });
    await updateBestCampaign(webpage, scoredCampaigns);
  })();
}
