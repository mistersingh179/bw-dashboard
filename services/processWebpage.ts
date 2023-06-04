import { Content, Webpage } from ".prisma/client";
import prisma from "@/lib/prisma";
import createContent from "@/services/createContent";
import createAdvertisementSpots from "@/services/createAdvertisementSpots";
import createScoredCampaigns from "@/services/createScoredCampaigns";
import createCategories from "@/services/createCategories";
import createAdvertisement from "@/services/createAdvertisement";
import createAdvertisementJob from "@/defer/createAdvertisementJob";
import { awaitResult } from "@defer/client";
import createScoredCampaignJob from "@/defer/createScoredCampaignJob";

export type WebpageWithContent = Webpage & { content: Content | null };

type ProcessWebpage = (webpage: Webpage) => Promise<void>;

// todo - accept user, settings, campaigns etc. as an injection
// todo - this way if the caller already has all that information,
// todo -  then this job does not need to look it up again
// todo - that is specifically true when this job is called from campaign job
// todo - which has that info and it is same for all webpages it call its on

const processWebpage: ProcessWebpage = async (webpage) => {
  console.log("started processWebpage with: ", webpage.url);

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
    console.log("aborting as unable to generate content");
    return;
  }

  const createScoredCampaignsJobWithResult = awaitResult(
    createScoredCampaignJob
  );
  await createScoredCampaignsJobWithResult(webpage, content, settings, user, campaigns);

  await createAdvertisementSpots(webpage, content, settings);

  await createCategories(webpage, content, user);

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

  for (const adSpot of adSpots) {
    for (const scoredCamp of scoredCamps) {
      const job = await createAdvertisementJob(adSpot, scoredCamp, settings);
      console.log(`scheduled job to create advertisement: ${job.id}`);
    }
  }
  console.log("finished processWebpage with: ", webpage.url);
};

export default processWebpage;

if (require.main === module) {
  (async () => {
    const webpage = await prisma.webpage.findFirstOrThrow({
      where: {
        id: "cliexl425001s98f16vq6fu6q",
      },
    });
    await processWebpage(webpage);
  })();
}
