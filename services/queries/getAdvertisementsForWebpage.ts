import prisma from "@/lib/prisma";
import {
  Advertisement,
  AdvertisementSpot,
  Campaign,
  ScoredCampaign,
} from "@prisma/client";

export type AdvertisementWithDetail = Advertisement & {
  advertisementSpot: AdvertisementSpot;
  scoredCampaign: ScoredCampaign & { campaign: Campaign };
};

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
  console.log("inside service: getAdvertisementsForWebpage");
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
          campaign: true,
        },
      },
      advertisementSpot: true,
    },
  });
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
    console.log(webpage.id, webpage.website.id, webpage.website.user.id);
    const ans = await getAdvertisementsForWebpage(
      webpage.id,
      webpage.website.id,
      webpage.website.user.id
    );
    console.dir(ans[0], { depth: 3 });
  })();
}
