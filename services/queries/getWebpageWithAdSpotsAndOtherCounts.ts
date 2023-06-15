import prisma from "@/lib/prisma";
import { Webpage } from ".prisma/client";
import { AdvertisementSpot } from "@prisma/client";
import logger from "@/lib/logger";

type AdSpotWithAdsCount = AdvertisementSpot & {
  _count: { advertisements: number };
};

export type WebpageWithAdSpotsAndOtherCounts = Webpage & {
  advertisementSpots: AdSpotWithAdsCount[];
  _count: { scoredCampaigns: number; advertisementSpots: number };
};

const myLogger = logger.child({ name: "getWebpageWithAdSpotsAndOtherCounts" });

type GetWebpageWithAdSpotsAndOtherCounts = (
  wpid: string,
  wsid: string,
  userId: string
) => Promise<WebpageWithAdSpotsAndOtherCounts>;

const getWebpageWithAdSpotsAndOtherCounts: GetWebpageWithAdSpotsAndOtherCounts =
  async (wpid, wsid, userId) => {
    myLogger.info({ wpid, wsid, userId }, "stared service");
    const webpage = await prisma.webpage.findFirstOrThrow({
      where: {
        id: wpid,
        website: {
          id: wsid,
          user: {
            id: userId,
          },
        },
      },
      include: {
        _count: {
          select: {
            advertisementSpots: true,
            scoredCampaigns: true,
          },
        },
        advertisementSpots: {
          include: {
            _count: {
              select: {
                advertisements: true,
              },
            },
          },
        },
      },
    });
    return webpage;
  };

export default getWebpageWithAdSpotsAndOtherCounts;

if (require.main === module) {
  (async () => {
    const webpage = await prisma.webpage.findFirstOrThrow({
      where: {
        id: "clh9d58tw000b98c04am7f6ik",
      },
      include: {
        advertisementSpots: true,
        website: {
          include: {
            user: true,
          },
        },
      },
    });
    const ans = await getWebpageWithAdSpotsAndOtherCounts(
      webpage.id,
      webpage.website.id,
      webpage.website.user.id
    );
    // console.dir(ans, { depth: 3 });
    console.log(ans.advertisementSpots.map((x) => x._count));
    const adCount = ans.advertisementSpots.reduce(
      (previousValue, currentValue) => {
        return previousValue + currentValue._count.advertisements;
      },
      0
    );
    console.log("ad count: ", adCount);
  })();
}
