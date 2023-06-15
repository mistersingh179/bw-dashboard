import { Content, Webpage } from ".prisma/client";
import prisma from "@/lib/prisma";
// import { JSDOM } from "jsdom";
import { HTMLElement, parse } from "node-html-parser";
import logger from "@/lib/logger";

function cleanArray(arr: (string | null | undefined)[]): string[] {
  const trimmedArray = arr.map((str) => {
    if (typeof str === "string") {
      return str.trim();
    }
    return "";
  });

  const cleanedArray = [...new Set(trimmedArray)];
  const filteredArray = cleanedArray.filter((str) => str !== "");

  return filteredArray;
}

const myLogger = logger.child({ name: "extractCategoriesFromWebpage" });

type ExtractCategoriesFromWebpage = (
  webpage: Webpage,
  content: Content
) => Promise<string[]>;

const extractCategoriesFromWebpage: ExtractCategoriesFromWebpage = async (
  webpage,
  content
) => {
  myLogger.info({url: webpage.url}, "starting service");

  let cumulativeValues: string[] = [];

  // const dom = new JSDOM(webpageWithContent.content.desktopHtml);
  // const {
  //   window: { document },
  // } = dom;

  const document = parse(content.desktopHtml);

  const metaContentValues = [
    ...document.querySelectorAll(
      `meta[property='article:tag'], meta[property='article:section'], meta[property^="og:tax"]`
    ),
  ].map((x) => x.getAttribute("content") || "");
  myLogger.info({metaContentValues}, "got metaContentValues");
  cumulativeValues = cumulativeValues.concat(metaContentValues);

  var allClasses = [];
  var allElements: HTMLElement[] = document.querySelectorAll("*");
  for (var i = 0; i < allElements.length; i++) {
    var classes = allElements[i].classNames.toString().split(/\s+/);
    for (var j = 0; j < classes.length; j++) {
      var cls = classes[j];
      if (cls && allClasses.indexOf(cls) === -1) allClasses.push(cls);
    }
  }
  const categoryClasses = allClasses.filter((x) => x.startsWith("category-"));
  logger.info({categoryClasses}, "got categoryClasses");
  cumulativeValues = cumulativeValues.concat(categoryClasses);

  const entryCategoryValues =
    document.querySelector(".entry-category")?.textContent?.split(",") || [];
  logger.info({entryCategoryValues}, "got entryCategoryValues");

  cumulativeValues = cumulativeValues.concat(entryCategoryValues);

  logger.info({cumulativeValues}, "got cumulativeValues");
  return cleanArray(cumulativeValues);
};

export default extractCategoriesFromWebpage;

if (require.main === module) {
  (async () => {
    const webpage = await prisma.webpage.findFirstOrThrow({
      where: {
        id: "cliuttkba003598suxjdzu1f3",
      },
      include: {
        content: true,
      },
    });
    const ans = await extractCategoriesFromWebpage(webpage, webpage.content!);
    console.log("*** ans: ", ans);
  })();
}
