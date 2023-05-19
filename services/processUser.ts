import prisma from "@/lib/prisma";
import { User } from ".prisma/client";
import createWebpages from "@/services/createWebpages";
import createContent from "@/services/createContent";
import createAdvertisementSpots from "@/services/createAdvertisementSpots";
import createScoredCampaigns from "@/services/createScoredCampaigns";
import createAdvertisement from "@/services/createAdvertisement";
import { subDays } from "date-fns";
import createCategories from "@/services/createCategories";

type ProcessUser = (user: User) => Promise<void>;

const processUser: ProcessUser = async (user) => {
  console.log("inside service processUser with: ", user.id, user.email);

  const websitesWhichNeedProcessing = await prisma.website.findMany({
    where: {
      userId: user.id,
      status: true,
      OR: [
        {
          processedOn: {
            lte: subDays(new Date(), 1),
          },
        },
        {
          processedOn: null,
        },
      ],
    },
  });

  for (const website of websitesWhichNeedProcessing) {
    await createWebpages(website.id);
  }

  const webpagesWithoutContent = await prisma.webpage.findMany({
    where: {
      website: {
        userId: user.id,
        status: true,
      },
      status: true,
      content: {
        is: null,
      },
    },
  });

  for (const webpage of webpagesWithoutContent) {
    await createContent(webpage);
  }

  const webpagesWithContentWithoutAdvertisementSpots =
    await prisma.webpage.findMany({
      where: {
        website: {
          userId: user.id,
          status: true,
        },
        content: {
          isNot: null
        },
        status: true,
        advertisementSpots: {
          none: {},
        },
      },
    });

  for (const webpage of webpagesWithContentWithoutAdvertisementSpots) {
    await createAdvertisementSpots(webpage);
  }

  const webpagesWithContent = await prisma.webpage.findMany({
    where: {
      website: {
        userId: user.id,
        status: true,
      },
      status: true,
      content: {
        isNot: null,
      },
    },
    include: {
      content: true
    }
  });

  for (const webpage of webpagesWithContent) {
    await createScoredCampaigns(webpage);
    await createCategories(webpage);
  }

  const webpages = await prisma.webpage.findMany({
    where: {
      website: {
        userId: user.id,
        status: true,
      },
      advertisementSpots: {
        some: {}
      },
      scoredCampaigns: {
        some: {}
      }
    },
    include: {
      advertisementSpots: true,
      scoredCampaigns: true,
    },
  });

  for (const wp of webpages) {
    console.log(
      "processing webpage: ",
      wp.id,
      "which has: ",
      wp.advertisementSpots.length,
      wp.scoredCampaigns.length
    );
    for (const advertisementSpot of wp.advertisementSpots) {
      for (const scoredCampaign of wp.scoredCampaigns) {
        await createAdvertisement(advertisementSpot, scoredCampaign);
      }
    }
  }
};

export default processUser;

if (require.main === module) {
  (async () => {
    const user = await prisma.user.findFirstOrThrow({
      where: {
        id: "clhtwckif000098wp207rs2fg",
      },
    });
    await processUser(user);
  })();
}
