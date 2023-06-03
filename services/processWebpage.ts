import { Content, Webpage } from ".prisma/client";
import prisma from "@/lib/prisma";
import createContent from "@/services/createContent";
import createAdvertisementSpots from "@/services/createAdvertisementSpots";
import createScoredCampaigns from "@/services/createScoredCampaigns";
import createCategories from "@/services/createCategories";
import createAdvertisement from "@/services/createAdvertisement";

export type WebpageWithContent = Webpage & { content: Content | null };

type ProcessWebpage = (webpage: Webpage) => Promise<void>;

const processWebpage: ProcessWebpage = async (webpage) => {
  console.log("started processWebpage with: ", webpage.url);

  const settings = await prisma.setting.findFirstOrThrow({
    where: {
      user: {
        websites: {
          some: {
            webpages: {
              some: {
                id: webpage.id
              }
            }
          }
        }
      }
    },
    include: {
      user: {
        include: {
          campaigns: true
        }
      }
    }
  })
  const user = settings.user;
  const campaigns = settings.user.campaigns;

  const content = await createContent(webpage, settings, user);
  if(content === null){
    console.log("aborting as unable to generate content");
    return
  }

  await createAdvertisementSpots(webpage, content, settings);
  await createScoredCampaigns(webpage, content, settings, user, campaigns);

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
      await createAdvertisement(adSpot, scoredCamp, settings);
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
      }
    });
    await processWebpage(webpage);
  })();
}
