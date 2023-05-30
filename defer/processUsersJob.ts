import { defer, getExecution } from "@defer/client";
import prisma from "@/lib/prisma";
import processUser from "@/services/processUser";

const processUsersJob = async () => {
  const users = await prisma.user.findMany({
    where: {
      setting: {
        status: true,
      },
    },
  });
  for (const user of users) {
    console.log("looping over users, now with: ", user.email);
    // await processUser(user);
  }
};

const deferredProcessUserJob = defer(processUsersJob, {
  retry: 0,
  concurrency: 1
});

export default deferredProcessUserJob;

(async () => {
  if (require.main === module) {
    console.log(deferredProcessUserJob);
    return;
    const { id: executionId } = await deferredProcessUserJob();
    const polling = setInterval(async () => {
      const { id, state, result } = await getExecution(executionId);
      console.log("checking functions status: ", id, state, result);
      if (state === "failed" || state === "succeed") {
        clearTimeout(polling);
      }
    }, 10);
  }
})();
