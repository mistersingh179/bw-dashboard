import { WebsiteUrl } from "@prisma/client";
import fetchHtmlOfWebpage from "@/services/helpers/fetchHtmlOfWebpage";
import prisma from "@/lib/prisma";

type UpdateCorpus = (websiteUrl: WebsiteUrl) => Promise<WebsiteUrl>;
const updateWebsiteUrlCorpus: UpdateCorpus = async (websiteUrl) => {
  const existingWebsiteUrl = await prisma.websiteUrl.findFirstOrThrow({
    where: {
      id: websiteUrl.id,
    },
  });
  if (existingWebsiteUrl.corpus?.length > 0) {
    console.log("aborting as corpus already exists");
    return existingWebsiteUrl;
  }

  const htmlContent = await fetchHtmlOfWebpage(websiteUrl.url);
  const updatedWebsiteUrl = await prisma.websiteUrl.update({
    where: {
      id: websiteUrl.id,
    },
    data: {
      corpus: htmlContent,
    },
  });
  return updatedWebsiteUrl;
};

export default updateWebsiteUrlCorpus;

if (require.main === module) {
  (async () => {
    const websiteUrl = await prisma.websiteUrl.findFirstOrThrow();
    const updatedWebsiteUrl = await updateWebsiteUrlCorpus(websiteUrl);
  })();
}
