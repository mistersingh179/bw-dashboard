import { Content, Webpage } from ".prisma/client";
import prisma from "@/lib/prisma";
import { JSDOM } from "jsdom";
import logger from "@/lib/logger";


const myLogger = logger.child({
  name: "extractTitleAndDescriptionFromWebpage",
});

type ExtractTitleAndDescriptionFromWebpage = (
  webpage: Webpage,
  content: Content
) => Promise<{title: string, description: string}>;

const extractTitleAndDescriptionFromWebpage: ExtractTitleAndDescriptionFromWebpage =
  async (webpage, content) => {
    myLogger.info({ url: webpage.url }, "starting service");

    const dom = new JSDOM(content.desktopHtml);
    const {
      window: { document },
    } = dom;

    const titleElement = document.querySelector("title");
    const title = titleElement?.textContent ?? "";
    myLogger.info({ title, url: webpage.url }, "got title");

    const metaDescriptionElement = document.querySelector(
      `meta[name='description']`
    );
    const description = metaDescriptionElement?.getAttribute("content") ?? "";
    myLogger.info({ description, url: webpage.url }, "got description");

    return {
      title,
      description,
    };
  };

export default extractTitleAndDescriptionFromWebpage;

if (require.main === module) {
  (async () => {
    const webpage = await prisma.webpage.findFirstOrThrow({
      where: {
        id: "clj7p8hyf000098xf2r5saq46",
      },
      include: {
        content: true,
      },
    });
    const ans = await extractTitleAndDescriptionFromWebpage(
      webpage,
      webpage.content!
    );
    console.log("*** ans: ", ans);
  })();
}
