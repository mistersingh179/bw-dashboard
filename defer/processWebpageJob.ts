import { defer } from "@defer/client";
import processWebpage, {WebpageWithContent} from "@/services/processWebpage";

const processWebpageJob = async (webpage: WebpageWithContent, userId: string) => {
  console.log("started processWebpageJob with: ", webpage.url);
  await processWebpage(webpage, userId);
  console.log("finished processWebpageJob with: ", webpage.url);
};

export default defer(processWebpageJob, {
  retry: 1,
  concurrency: 10,
});
