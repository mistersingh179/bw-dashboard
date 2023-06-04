import { defer } from "@defer/client";
import processWebpage from "@/services/processWebpage";
import {Webpage, Website} from ".prisma/client";
import {Setting} from "@prisma/client";
import downloadWebpages from "@/services/downloadWebpages";

const downloadWebpagesJob = async (website: Website, settings: Setting, sitemapUrl?: string ) => {
  console.log("started downloadWebpagesJob with: ", website.topLevelDomainUrl);
  await downloadWebpages(website, settings, sitemapUrl);
  console.log("finished downloadWebpagesJob with: ", website.topLevelDomainUrl);
};

export default defer(downloadWebpagesJob, {
  retry: 1,
  concurrency: 20,
});
