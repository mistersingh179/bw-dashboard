import prisma from "@/lib/prisma";
import { User } from ".prisma/client";
import createWebpages from "@/services/createWebpages";
import createAdvertisementSpots from "@/services/createAdvertisementSpots";
import { subDays } from "date-fns";
import createCategories from "@/services/createCategories";
import createContentJob from "@/defer/createContentJob";
import { awaitResult } from "@defer/client";
import createScoredCampaignJob from "@/defer/createScoredCampaignJob";
import createAdvertisementJob from "@/defer/createAdvertisementJob";

type ProcessUser = (user: User) => Promise<void>;

const processUser: ProcessUser = async (user) => {
  console.log("started processUser with: ", user.id, user.email);
  const settings = await prisma.setting.findFirstOrThrow({
    where: {
      userId: user.id,
      status: true,
    },
  });

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

  const createContentJobWithResult = awaitResult(createContentJob);
  const createContentResult = await Promise.allSettled(
    webpagesWithoutContent.map(async (webpage) => {
      return createContentJobWithResult(webpage);
    })
  );
  console.log(
    "createContentResult: ",
    createContentResult.map((r) => r.status)
  );

  const webpagesWithContentWithoutAdvertisementSpots =
    await prisma.webpage.findMany({
      where: {
        website: {
          userId: user.id,
          status: true,
        },
        content: {
          isNot: null,
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
      content: true,
    },
  });

  const createScoredCampaignJobWithResult = awaitResult(
    createScoredCampaignJob
  );
  const createScoreCampaignResult = await Promise.allSettled(
    webpagesWithContent.map((webpage) => {
      createScoredCampaignJobWithResult(webpage);
    })
  );
  console.log(
    "createScoreCampaignResult: ",
    createScoreCampaignResult.map((r) => r.status)
  );

  for (const webpage of webpagesWithContent) {
    await createCategories(webpage);
  }

  // todo - extract only those webpages which dont have have enough advertisements for each spot & campaign combination
  const webpagesWithAdSpotsAndScoredCamps = await prisma.webpage.findMany({
    where: {
      website: {
        userId: user.id,
        status: true,
      },
      advertisementSpots: {
        some: {},
      },
      scoredCampaigns: {
        some: {},
      },
    },
    include: {
      advertisementSpots: true,
      scoredCampaigns: true,
    },
  });

  const createAdvertisementJobWithResult = awaitResult(createAdvertisementJob);

  const createAdvertisementResultPromises: Promise<void>[] = [];
  for (const wp of webpagesWithAdSpotsAndScoredCamps) {
    for (const advertisementSpot of wp.advertisementSpots) {
      for (const scoredCampaign of wp.scoredCampaigns) {
        const promiseResult = createAdvertisementJobWithResult(
          advertisementSpot,
          scoredCampaign,
          settings
        );
        createAdvertisementResultPromises.push(promiseResult);
      }
    }
  }

  const createAdvertisementResult = await Promise.allSettled(
    createAdvertisementResultPromises
  );
  console.log(
    "createAdvertisementResult:",
    createAdvertisementResult.map((r) => r.status)
  );

  console.log("finished processUser with: ", user.id, user.email);
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
