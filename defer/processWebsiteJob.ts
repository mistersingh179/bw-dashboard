import { defer } from "@defer/client";
import processWebsite from "@/services/processWebsite";
import { Website } from ".prisma/client";
import {Setting} from "@prisma/client";

const processWebsiteJob = async (website: Website, settings: Setting) => {
  console.log("started processWebsiteJob with: ", website.topLevelDomainUrl);
  await processWebsite(website, settings);
  console.log("finished processWebsiteJob with: ", website.topLevelDomainUrl);
};

export default defer(processWebsiteJob, {
  retry: 1,
  concurrency: 20,
});
