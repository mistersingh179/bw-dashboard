import prisma from "@/lib/prisma";
import {User} from ".prisma/client";
import createWebpages from "@/services/createWebpages";
import updateHtml from "@/services/updateHtml";
import createAdvertisementSpots from "@/services/createAdvertisementSpots";
import createScoredCampaigns from "@/services/createScoredCampaigns";
import createAdvertisement from "@/services/createAdvertisement";
import {subDays} from "date-fns";
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

  const webpagesWithoutHtml = await prisma.webpage.findMany({
    where: {
      website: {
        userId: user.id,
        status: true,
      },
      status: true,
      html: "",
    },
  });

  for (const webpage of webpagesWithoutHtml) {
    await updateHtml(webpage);
  }

  const webpagesWithHtmlWithoutAdvertisementSpots =
    await prisma.webpage.findMany({
      where: {
        website: {
          userId: user.id,
          status: true,
        },
        html: {
          not: "",
        },
        status: true,
        advertisementSpots: {
          none: {},
        },
      },
    });

  for (const webpage of webpagesWithHtmlWithoutAdvertisementSpots) {
    await createAdvertisementSpots(webpage);
  }

  const webpagesWithHtml = await prisma.webpage.findMany({
    where: {
      website: {
        userId: user.id,
        status: true,
      },
      status: true,
      html: {
        not: "",
      },
    },
  });

  for (const webpage of webpagesWithHtml) {
    await createScoredCampaigns(webpage);
    await createCategories(webpage);
  }

  const webpages = await prisma.webpage.findMany({
    where: {
      website: {
        userId: user.id,
        status: true,
      },
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
        id: "clfqyzo1z000k98fclzdb0h0e",
      },
    });
    await processUser(user);
  })();
}
