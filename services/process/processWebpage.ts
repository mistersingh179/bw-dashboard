import { Content, Webpage } from ".prisma/client";
import prisma from "@/lib/prisma";
import createContent from "@/services/create/createContent";
import createAdvertisementSpots from "@/services/create/createAdvertisementSpots";
import createCategories from "@/services/create/createCategories";
import createScoredCampaigns from "@/services/create/createScoredCampaigns";
import createAdvertisementQueue from "@/jobs/queues/createAdvertisementQueue";
import logger from "@/lib/logger";
import setTitleAndDescription from "@/services/setTitleAndDescription";

export type WebpageWithContent = Webpage & { content: Content | null };

const myLogger = logger.child({ name: "processWebpage" });

type ProcessWebpage = (webpage: Webpage) => Promise<void>;

// todo - accept user, settings, campaigns etc. as an injection
// todo - this way if the caller already has all that information,
// todo -  then this job does not need to look it up again
// todo - that is specifically true when this job is called from campaign job
// todo - which has that info and it is same for all webpages it call its on

const processWebpage: ProcessWebpage = async (webpage) => {
  myLogger.info({ webpage }, "starting service");

  const settings = await prisma.setting.findFirstOrThrow({
    where: {
      user: {
        websites: {
          some: {
            webpages: {
              some: {
                id: webpage.id,
              },
            },
          },
        },
      },
    },
    include: {
      user: {
        include: {
          campaigns: true,
        },
      },
    },
  });
  const user = settings.user;
  const campaigns = settings.user.campaigns;

  const content = await createContent(webpage, settings, user);
  if (content === null) {
    myLogger.info({ webpage }, "aborting as unable to generate content");
    return;
  }

  // todo - do this async
  const scoreResult = await createScoredCampaigns(
    webpage,
    content,
    settings,
    user,
    campaigns
  );
  if (scoreResult === null) {
    myLogger.info(
      { webpage },
      "aborting as unable to generate scored campaigns"
    );
    return;
  }

  await createAdvertisementSpots(webpage, content, settings);

  await createCategories(webpage, content, user);

  await setTitleAndDescription(webpage, content, user);

  const adSpots = await prisma.advertisementSpot.findMany({
    where: {
      webpageId: webpage.id,
    },
  });

  const scoredCamps = await prisma.scoredCampaign.findMany({
    where: {
      webpageId: webpage.id,
    },
  });

  // myLogger.info({ webpage, adSpots, scoredCamps }, "going to build ads");

  // for (const adSpot of adSpots) {
  //   for (const scoredCamp of scoredCamps) {
  //     const job = await createAdvertisementQueue.add("createAdvertisement", {
  //       advertisementSpot: adSpot,
  //       scoredCampaign: scoredCamp,
  //       settings: settings,
  //     });
  //     myLogger.info(
  //       { webpage, id: job.id, adSpot, scoredCamp },
  //       "scheduled job to create ad"
  //     );
  //   }
  // }
  myLogger.info({ webpage }, "finished service");
};

export default processWebpage;

if (require.main === module) {
  (async () => {
    const webpage = await prisma.webpage.findFirstOrThrow({
      where: {
        id: "cljhmbgdr003ioo21xwik9mm1",
      },
    });
    await processWebpage(webpage);
  })();
}
