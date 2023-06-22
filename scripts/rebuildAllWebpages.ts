import prisma from "@/lib/prisma";
import {omit} from "lodash";
import processWebpage from "@/services/processWebpage";
import processWebpageQueue from "@/jobs/queues/processWebpageQueue";

(async () => {
  console.log("in script rebuildAllWebpages");
  const webpages = await prisma.webpage.findMany({});
  console.log("webpages.length: ", webpages.length)
  for(const wp of webpages){
    console.log("processing wp: ", wp.id);
    await prisma.webpage.delete({
      where: {
        id: wp.id
      }
    })
    const newWp = await prisma.webpage.create({
      data: omit(wp, ["id", "createdAt", "updatedAt", "lastModifiedAt"])
    })
    const job = await processWebpageQueue.add("processWebpage", {
      webpage: wp
      ,
    });
    console.log({id: job.id, url: wp.url}, "scheduled job to process webpage")
  }
})();

export {}
