import { Webpage, Website } from ".prisma/client";
import prisma from "@/lib/prisma";
import {
  Advertisement,
  AdvertisementSpot,
  Campaign,
  ScoredCampaign,
} from "@prisma/client";

type GetWebpageDetail = (webpageId: string) => Promise<WebpageWithDetail>;

type WebpageWithDetail = Webpage & {
  website: Website;
  _count: { scoredCampaigns: number; advertisementSpots: number };
  scoredCampaigns: (ScoredCampaign & {
    campaign: Campaign;
    advertisements: Advertisement[];
    _count: { advertisements: number };
  })[];
  advertisementSpots: (AdvertisementSpot & {
    advertisements: Advertisement[];
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
          advertisements: true,
          _count: {
            select: {
              advertisements: true,
            },
          },
        },
      },
      advertisementSpots: {
        include: {
          advertisements: true,
        },
      },
      website: true,
      _count: {
        select: {
          scoredCampaigns: true,
          advertisementSpots: true,
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
    console.log(ans.scoredCampaigns[0].advertisements.length);
    console.log(ans.advertisementSpots[0].advertisements.length);

  })();
}
