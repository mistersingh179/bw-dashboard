import { Webpage, Website } from ".prisma/client";
import prisma from "@/lib/prisma";
import {
  Advertisement,
  AdvertisementSpot,
  Campaign,
  ScoredCampaign,
} from "@prisma/client";

type GetWebpageDetail = (webpageId: string) => Promise<WebpageWithDetail>;

export type WebpageWithDetail = Webpage & {
  scoredCampaigns: (ScoredCampaign & {
    campaign: Campaign;
    advertisements: (Advertisement & {
      advertisementSpot: AdvertisementSpot;
    })[];
  })[];
};


const getWebpageDetail: GetWebpageDetail = async (webpageId) => {
  console.log("inside service: getWebpageDetail");
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
