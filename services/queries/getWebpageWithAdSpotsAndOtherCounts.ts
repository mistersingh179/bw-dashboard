import prisma from "@/lib/prisma";
import { Webpage } from ".prisma/client";
import {
  AdvertisementSpot,
  MetaContent,
  MetaContentSpot,
  MetaContentType,
} from "@prisma/client";
import logger from "@/lib/logger";

type AdSpotWithAdsCount = AdvertisementSpot & {
  _count: { advertisements: number };
};

export type MetaContentSpotsWithMetaContentAndType = MetaContentSpot & {
  metaContents: (MetaContent & {
    metaContentType: MetaContentType;
  })[];
};

export type WebpageWithAdSpotsAndOtherCounts = Webpage & {
  advertisementSpots: AdSpotWithAdsCount[];
  metaContentSpots: MetaContentSpotsWithMetaContentAndType[];
  content: { title: string | null; description: string | null } | null;
  _count: {
    scoredCampaigns: number;
    advertisementSpots: number;
    metaContentSpots: number;
  };
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
            metaContentSpots: true,
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
        metaContentSpots: {
          include: {
            metaContents: {
              include: {
                metaContentType: true,
              },
            },
          },
        },
        content: {
          select: {
            title: true,
            description: true,
          },
        },
      },
    });
    return webpage as unknown as WebpageWithAdSpotsAndOtherCounts;
  };

export default getWebpageWithAdSpotsAndOtherCounts;

if (require.main === module) {
  (async () => {
    const webpage = await prisma.webpage.findFirstOrThrow({
      where: {
        id: "clkrey0jx000m985gb765ieg0",
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
