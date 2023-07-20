import logger from "@/lib/logger";
import { ScoredCampaign, Webpage } from "@prisma/client";
import prisma from "@/lib/prisma";
import setScoredCampaignBest from "@/services/queries/setScoredCampaignBest";
import setNoCampaignAsBest from "@/services/queries/setNoCampaignAsBest";

type UpdateBestCampaign = (
  webpage: Webpage,
  scoredCampaign: ScoredCampaign | null | undefined
) => Promise<void>;

const updateBestCampaign: UpdateBestCampaign = async (
  webpage,
  scoredCampaign
) => {
  const myLogger = logger.child({
    name: "updateBestCampaign",
    webpage,
    scoredCampaign,
  });
  myLogger.info({ webpage, scoredCampaign }, "started service");

  let result;
  if (scoredCampaign) {
    result = await setScoredCampaignBest(
      scoredCampaign.id,
      scoredCampaign.webpageId
    );
  } else if (!scoredCampaign) {
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
    const scoredCampaign = await prisma.scoredCampaign.findFirstOrThrow({
      where: {
        id: "clk9r8fr1000298ii0m1ifqkb",
      },
    });
    await updateBestCampaign(webpage, scoredCampaign);
  })();
}
