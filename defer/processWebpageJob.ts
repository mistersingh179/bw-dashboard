import { defer } from "@defer/client";
import processWebpage, {WebpageWithContent} from "@/services/processWebpage";
import {Webpage} from ".prisma/client";

const processWebpageJob = async (webpage: Webpage) => {
  console.log("started processWebpageJob with: ", webpage.url);
  await processWebpage(webpage);
  console.log("finished processWebpageJob with: ", webpage.url);
};

export default defer(processWebpageJob, {
  retry: 1,
  concurrency: 20,
});
