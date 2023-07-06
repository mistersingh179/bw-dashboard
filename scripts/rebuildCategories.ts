import prisma from "@/lib/prisma";
import createCategories from "@/services/createCategories";

(async () => {
  console.log("in script rebuildCategories");
  const website = await prisma.website.findFirstOrThrow({
    where: {
      id: "clit44gjw002rmn08y9evlk59"
    },
    include: {
      webpages: {
        include: {
          content: true
        }
      },
      user: true
    }
  })
  for(const webpage of website.webpages){
    await createCategories(webpage, webpage.content!, website.user, false);
  }
})();

export {}
