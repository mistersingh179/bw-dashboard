import prisma from "@/lib/prisma";
import { User } from ".prisma/client";
import downloadWebpages from "@/services/downloadWebpages";
import createAdvertisementSpots from "@/services/createAdvertisementSpots";
import { subDays } from "date-fns";
import createCategories from "@/services/createCategories";
import createContentJob from "@/defer/createContentJob";
import { awaitResult } from "@defer/client";
import createScoredCampaignJob from "@/defer/createScoredCampaignJob";
import createAdvertisementJob from "@/defer/createAdvertisementJob";
import {Setting} from "@prisma/client";
import processWebsiteJob from "@/defer/processWebsiteJob";

type ProcessUser = (user: User, settings: Setting) => Promise<void>;

const processUser: ProcessUser = async (user, settings) => {
  console.log("started processUser with: ", user.email);

  const websites = await prisma.website.findMany({
    where: {
      userId: user.id
    }
  })

  console.log("count of websites to process: ", websites.length);

  for (const ws of websites){
    console.log("at ws: ", ws.topLevelDomainUrl);
    const job = await processWebsiteJob(ws, settings);
    console.log(`scheduled job to process website: `, job.id);
  }

  console.log("finished processUser with: ", user.id, user.email);
};

export default processUser;

if (require.main === module) {
  (async () => {
    const user = await prisma.user.findFirstOrThrow({
      where: {
        id: "clhtwckif000098wp207rs2fg",
      },
      include: {
        setting: true
      }
    });
    await processUser(user, user.setting!);
  })();
}
