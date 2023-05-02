import { Webpage } from "@prisma/client";
import fetchHtmlOfWebpage from "@/services/helpers/fetchHtmlOfWebpage";
import prisma from "@/lib/prisma";

type UpdateCorpus = (webpage: Webpage) => Promise<Webpage>;
const updateWebpageCorpus: UpdateCorpus = async (webpage) => {
  const existingWebpage = await prisma.webpage.findFirstOrThrow({
    where: {
      id: webpage.id,
    },
  });
  if (existingWebpage.html?.length > 0) {
    console.log("aborting as html already exists");
    return existingWebpage;
  }

  const htmlContent = await fetchHtmlOfWebpage(webpage.url);
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
    const webpage = await prisma.webpage.findFirstOrThrow();
    const updatedWebpage = await updateWebpageCorpus(webpage);
    console.log(updatedWebpage);
  })();
}
