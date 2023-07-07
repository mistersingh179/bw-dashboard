import { Content, Webpage } from ".prisma/client";
import prisma from "@/lib/prisma";
import { JSDOM } from "jsdom";
import logger from "@/lib/logger";
import createContent from "@/services/createContent";
import getCategoriesFromMetaTags from "@/helpers/getCategoriesFromMetaTags";
import getCategoriesFromClasses from "@/helpers/getCategoriesFromClasses";
import getCategoriesFromEntryCategoryElement from "@/helpers/getCategoriesFromEntryCategoryElement";
import getCleanCategories from "@/helpers/getCleanCategories";

const myLogger = logger.child({ name: "extractCategoriesFromWebpage" });

type ExtractCategoriesFromWebpage = (
  webpage: Webpage,
  content: Content
) => Promise<string[]>;

const extractCategoriesFromWebpage: ExtractCategoriesFromWebpage = async (
  webpage,
  content
) => {
  myLogger.info({ url: webpage.url }, "starting service");

  const dom = new JSDOM(content.desktopHtml);
  const {
    window: { document },
  } = dom;

  let cumulativeValues: string[] = [];

  const metaContentValues = getCategoriesFromMetaTags(document);
  myLogger.info({ metaContentValues }, "got metaContentValues");
  cumulativeValues = cumulativeValues.concat(metaContentValues);

  const categoryClasses = getCategoriesFromClasses(document);
  myLogger.info({ categoryClasses }, "got categoryClasses");
  cumulativeValues = cumulativeValues.concat(categoryClasses);

  const categoryElementValues = getCategoriesFromEntryCategoryElement(document);
  myLogger.info({ categoryElementValues }, "got categoryElementValues");
  cumulativeValues = cumulativeValues.concat(categoryElementValues);

  return getCleanCategories(cumulativeValues);
};

export default extractCategoriesFromWebpage;

if (require.main === module) {
  (async () => {
    const webpage = await prisma.webpage.findFirstOrThrow({
      where: {
        id: "cljr7yveg005398cicqm09eij",
      },
      include: {
        content: true,
        website: {
          include: {
            user: {
              include: {
                setting: true,
              },
            },
          },
        },
      },
    });
    await createContent(
      webpage,
      webpage.website.user.setting!,
      webpage.website.user,
      false
    );
    const webpageAgain = await prisma.webpage.findFirstOrThrow({
      where: {
        id: "cljr7yveg005398cicqm09eij",
      },
      include: {
        content: true,
      },
    });
    const ans = await extractCategoriesFromWebpage(
      webpageAgain,
      webpageAgain.content!
    );
    myLogger.info({ ans }, "*** ans: ");
  })();
}
