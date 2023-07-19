import prisma from "@/lib/prisma";
import createCategories from "@/services/create/createCategories";
import createContent from "@/services/create/createContent";

(async () => {
  console.log("in script rebuildContent");
  const website = await prisma.website.findFirstOrThrow({
    where: {
      id: "clit44gjw002rmn08y9evlk59"
    },
    include: {
      webpages: true,
      user: {
        include: {
          setting: true
        }
      }
    }
  })
  for(const webpage of website.webpages){
    await createContent(webpage, website.user.setting!, website.user, false);
  }
})();

export {}
