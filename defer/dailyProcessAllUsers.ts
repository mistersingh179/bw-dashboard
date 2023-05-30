import { defer } from "@defer/client";
import prisma from "@/lib/prisma";
import processUserJob from "@/defer/processUserJob";

const dailyProcessAllUsers = async () => {
  console.log("started dailyProcessAllUsers");
  const users = await prisma.user.findMany({
    where: {
      setting: {
        status: true
      }
    }
  })
  console.log("we have user count: ", users.length, " to process");
  for(const user of users){
    console.log("calling processUserJob with: ", user.email);
    processUserJob(user);
  }
  console.log("finished dailyProcessAllUsers");
};

export default defer.cron(dailyProcessAllUsers, "0 18 * * *");
