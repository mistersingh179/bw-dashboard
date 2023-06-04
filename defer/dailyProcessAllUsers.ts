import { defer } from "@defer/client";
import prisma from "@/lib/prisma";
import processUserJob from "@/defer/processUserJob";

const dailyProcessAllUsers = async () => {
  console.log("started dailyProcessAllUsers");
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
    const job = await processUserJob(user, user.setting);
    console.log("schedules job to process user: ", user.email);
  }

  console.log("finished dailyProcessAllUsers");
};

export default defer.cron(dailyProcessAllUsers, "0 18 * * *");

if (require.main === module) {
  dailyProcessAllUsers();
}
