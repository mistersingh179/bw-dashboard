import { Webpage } from "@prisma/client";
import fetchContentOfWebpage from "@/services/helpers/fetchContentOfWebpage";
import prisma from "@/lib/prisma";

type UpdateHtml = (webpage: Webpage) => Promise<Webpage>;
const updateWebpageCorpus: UpdateHtml = async (webpage) => {
  const existingWebpage = await prisma.webpage.findFirstOrThrow({
    where: {
      id: webpage.id,
    },
  });
  if (existingWebpage.html?.length > 0) {
    console.log("aborting as html already exists");
    return existingWebpage;
  }

  const htmlContent = await fetchContentOfWebpage(webpage.url, "text/html");
  const updatedWebpage = await prisma.webpage.update({
    where: {
      id: webpage.id,
    },
    data: {
      html: htmlContent,
    },
  });
  return updatedWebpage;
};

export default updateWebpageCorpus;

if (require.main === module) {
  (async () => {
    const webpage = await prisma.webpage.findFirstOrThrow({
      where: {
        id: "clh6eip82001298kw3dmr4idj",
      },
    });
    const updatedWebpage = await updateWebpageCorpus(webpage);
    console.log(updatedWebpage);
  })();
}
