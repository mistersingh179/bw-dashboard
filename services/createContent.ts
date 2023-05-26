import { Webpage } from "@prisma/client";
import fetchContentOfWebpage from "@/services/helpers/fetchContentOfWebpage";
import prisma from "@/lib/prisma";

type CreateContent = (webpage: Webpage) => Promise<Webpage>;
const createContent: CreateContent = async (webpage) => {
  const existingWebpage = await prisma.webpage.findFirstOrThrow({
    where: {
      id: webpage.id,
    },
    include: {
      content: true,
    },
  });

  if (existingWebpage.content !== null) {
    console.log("aborting as content already exists");
    return existingWebpage;
  }

  let htmlContent = '';
  try{
    htmlContent = await fetchContentOfWebpage(webpage.url, "text/html");
  }catch(err){
    console.log("aborting as got error while fetching content of webpage: ", err);
    return existingWebpage;
  }

  const updatedWebpage = await prisma.webpage.update({
    where: {
      id: webpage.id,
    },
    data: {
      content: {
        upsert: {
          create: {
            desktopHtml: htmlContent
          },
          update: {
            desktopHtml: htmlContent
          }
        }
      }
    }
  });

  return updatedWebpage;
};

export default createContent;

if (require.main === module) {
  (async () => {
    const webpage = await prisma.webpage.findFirstOrThrow({
      where: {
        id: "cli38233j000098m9ug7e78m7",
      },
    });
    const updatedWebpage = await createContent(webpage);
    console.log(updatedWebpage);
  })();
}
