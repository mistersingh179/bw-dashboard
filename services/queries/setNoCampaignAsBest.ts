import logger from "@/lib/logger";
import prisma from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import BatchPayload = Prisma.BatchPayload;

type SetNoCampaignAsBest = (webpageId: string) => Promise<BatchPayload>;

const setNoCampaignAsBest: SetNoCampaignAsBest = async (webpageId) => {
  const myLogger = logger.child({ name: "setNoCampaignAsBest", webpageId });
  myLogger.info({}, "started service");

  const result = await prisma.scoredCampaign.updateMany({
    where: {
      webpageId,
      isBest: true
    },
    data: {
      isBest: false,
    }
  });

  myLogger.info({result}, "finished service");

  return result;
};

export default setNoCampaignAsBest;

if (require.main === module) {
  (async () => {
    const webpage = await prisma.webpage.findFirstOrThrow({
      where: {
        id: "clk9r8fj800049889eu3qpvxt"
      }
    })
    await setNoCampaignAsBest(webpage.id);
  })();
}
