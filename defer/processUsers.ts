import { defer, getExecution } from "@defer/client";
import prisma from "@/lib/prisma";
import processUser from "@/services/processUser";

/*
Process all users at 6 PM every day
*/

const processUsers = async () => {
  const users = await prisma.user.findMany({
    where: {
      setting: {
        status: true,
      },
    },
  });
  for (const user of users) {
    console.log("looping over users, now with: ", user.email);
    await processUser(user);
  }
};

export default defer.cron(processUsers, '0 18 * * *')