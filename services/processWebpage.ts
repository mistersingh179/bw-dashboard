import { Content, Webpage } from ".prisma/client";
import prisma from "@/lib/prisma";
import createContent from "@/services/createContent";
import createAdvertisementSpots from "@/services/createAdvertisementSpots";
import createScoredCampaigns from "@/services/createScoredCampaigns";
import createCategories from "@/services/createCategories";
import createAdvertisement from "@/services/createAdvertisement";

export type WebpageWithContent = Webpage & { content: Content | null };

type ProcessWebpage = (webpage: WebpageWithContent, userId: string) => Promise<void>;

const processWebpage: ProcessWebpage = async (webpage, userId) => {
  console.log("started processWebpage with: ", webpage.url);

  const settings = await prisma.setting.findFirstOrThrow({
    where: {
      userId: userId,
    }
  })

  await createContent(webpage);
  await createAdvertisementSpots(webpage, settings);
  await createScoredCampaigns(webpage);
  await createCategories(webpage);

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
      await createAdvertisement(
        adSpot,
        scoredCamp,
        settings
      );
    }
  }
  console.log("finished processWebpage with: ", webpage.url);
};

export default processWebpage;

if (require.main === module) {
  (async () => {
    const webpage = await prisma.webpage.findFirstOrThrow({
      where: {
        id: "cli38233j000098m9ug7e78m7",
      },
      include: {
        content: true,
      },
    });
    await processWebpage(webpage, "clhtwckif000098wp207rs2fg");
  })();
}
