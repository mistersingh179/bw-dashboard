import prisma from "@/lib/prisma";
import {
  Advertisement,
  AdvertisementSpot,
  Campaign,
  ScoredCampaign,
} from "@prisma/client";
import { Category, Webpage } from ".prisma/client";
import logger from "@/lib/logger";

export type AdvertisementWithDetail = Advertisement & {
  advertisementSpot: AdvertisementSpot & {
    webpage: Webpage & { categories: Category[] };
  };
  scoredCampaign: ScoredCampaign & {
    campaign: Campaign & { categories: Category[] };
  };
};

const myLogger = logger.child({ name: "getAdvertisementsForWebpage" });

type GetAdvertisementsForWebpage = (
  websiteId: string,
  webpageId: string,
  userId: string
) => Promise<AdvertisementWithDetail[]>;

const getAdvertisementsForWebpage: GetAdvertisementsForWebpage = async (
  websiteId,
  webpageId,
  userId
) => {
  myLogger.info({ websiteId, webpageId, userId }, "started service");
  const advertisements = await prisma.advertisement.findMany({
    where: {
      scoredCampaign: {
        webpage: {
          id: webpageId,
          website: {
            id: websiteId,
            user: {
              id: userId,
            },
          },
        },
      },
    },
    include: {
      scoredCampaign: {
        include: {
          campaign: {
            include: { categories: true },
          },
        },
      },
      advertisementSpot: {
        include: {
          webpage: {
            include: {
              categories: true,
            },
          },
        },
      },
    },
  });
  myLogger.info({ length: advertisements.length }, "got advertisements");
  return advertisements;
};

export default getAdvertisementsForWebpage;

if (require.main === module) {
  (async () => {
    const webpage = await prisma.webpage.findFirstOrThrow({
      where: {
        id: "clh9d58tw000098c05nhdmbql",
      },
      include: {
        website: {
          include: {
            user: true,
          },
        },
      },
    });
    const ans = await getAdvertisementsForWebpage(
      webpage.id,
      webpage.website.id,
      webpage.website.user.id
    );
    console.dir(ans[0], { depth: 3 });
  })();
}
