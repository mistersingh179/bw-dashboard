import { defer, awaitResult } from "@defer/client";
import processUser from "@/services/processUser";
import {User, Webpage} from ".prisma/client";
import createContent from "@/services/createContent";

const createContentJob = async (webpage: Webpage) => {
  console.log("started createContentJob with: ", webpage.url);
  await createContent(webpage);
  console.log("finished createContentJob with: ", webpage.url);
};

export default defer(createContentJob, {
  retry: 1,
  concurrency: 20,
});
