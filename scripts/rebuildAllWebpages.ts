import prisma from "@/lib/prisma";
import {omit} from "lodash";
import processWebpage from "@/services/processWebpage";

(async () => {
  console.log("in script rebuildAllWebpages");
  const webpages = await prisma.webpage.findMany({});
  console.log("webpages.length: ", webpages.length)
  for(const wp of webpages){
    console.log("processing wp: ", wp.id, wp.url, wp.status);
    await prisma.webpage.delete({
      where: {
        id: wp.id
      }
    })
    const newWp = await prisma.webpage.create({
      data: omit(wp, ["id", "createdAt", "updatedAt", "lastModifiedAt"])
    })
    await processWebpage(newWp);
  }
})();

export {}
