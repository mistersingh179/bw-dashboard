import prisma from "@/lib/prisma";
import processUserQueue from "@/jobs/queues/processUserQueue";

type ProcessAllUsers = () => Promise<void>;

const processAllUsers: ProcessAllUsers = async () => {
  console.log("started processAllUsers");

  const users = await prisma.user.findMany({
    where: {
      setting: {
        webpageLookbackDays: {
          gt: 0,
        },
      },
    },
    include: {
      setting: true,
    },
  });

  console.log("we have user count: ", users.length, " to process");

  for (const user of users) {
    if (!user.setting) {
      console.log("skipping no settings user: ", user.email);
      continue;
    }
    console.log("at user: ", user.email);
    const job = await processUserQueue.add("processUser", {
      user,
      settings: user.setting,
    });
    console.log("schedule job to process user: ", user.email, job.id);
  }

  console.log("finished processAllUsers");
};

export default processAllUsers;
