import prisma from "@/lib/prisma";
import { User } from ".prisma/client";
import { Setting } from "@prisma/client";
import processWebsiteQueue from "@/jobs/queues/processWebsiteQueue";

type ProcessUser = (user: User, settings: Setting) => Promise<void>;

const processUser: ProcessUser = async (user, settings) => {
  console.log("started processUser with: ", user.email);

  const websites = await prisma.website.findMany({
    where: {
      userId: user.id,
    },
  });

  console.log("count of websites to process: ", websites.length);

  for (const website of websites) {
    console.log("at website: ", website.topLevelDomainUrl);
    const job = await processWebsiteQueue.add("processWebsite", {
      website,
      settings,
    });
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
        setting: true,
      },
    });
    await processUser(user, user.setting!);
  })();
}
