import { Webpage, Website } from ".prisma/client";
import prisma from "@/lib/prisma";
import {
  Advertisement,
  AdvertisementSpot,
  Campaign,
  ScoredCampaign,
} from "@prisma/client";
import logger from "@/lib/logger";

export type WebpageWithDetail = Webpage & {
  scoredCampaigns: (ScoredCampaign & {
    campaign: Campaign;
    advertisements: (Advertisement & {
      advertisementSpot: AdvertisementSpot;
    })[];
  })[];
};

const myLogger = logger.child({ name: "getWebpageDetail" });

type GetWebpageDetail = (webpageId: string) => Promise<WebpageWithDetail>;

const getWebpageDetail: GetWebpageDetail = async (webpageId) => {
  myLogger.info({ webpageId }, "starting service");

  const webpage = await prisma.webpage.findFirstOrThrow({
    where: {
      id: webpageId,
    },
    include: {
      scoredCampaigns: {
        include: {
          campaign: true,
          advertisements: {
            include: {
              advertisementSpot: true,
            },
          },
        },
      },
    },
  });
  return webpage;
};

export default getWebpageDetail;

if (require.main === module) {
  (async () => {
    const ans = await getWebpageDetail("clh9d58tw000098c05nhdmbql");
    console.dir(ans, { depth: 4 });
  })();
}
