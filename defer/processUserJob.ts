import { defer } from "@defer/client";
import processUser from "@/services/processUser";
import { User } from ".prisma/client";

const processUserJob = async (user: User) => {
  console.log("started processUserJob with: ", user.email);
  await processUser(user);
  console.log("finished processUserJob with: ", user.email);
};

export default defer(processUserJob, {
  retry: 1,
  concurrency: 10,
});
