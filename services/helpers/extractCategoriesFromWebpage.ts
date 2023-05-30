import { Webpage } from ".prisma/client";
import prisma from "@/lib/prisma";
// import { JSDOM } from "jsdom";
import { parse, HTMLElement } from 'node-html-parser';

type ExtractCategoriesFromWebpage = (webpage: Webpage) => Promise<string[]>;

function cleanArray(arr: (string | null | undefined)[]): string[] {
  const trimmedArray = arr.map((str) => {
    if (typeof str === 'string') {
      return str.trim();
    }
    return '';
  });

  const cleanedArray = [...new Set(trimmedArray)];
  const filteredArray = cleanedArray.filter((str) => str !== '');

  return filteredArray;
}

const extractCategoriesFromWebpage: ExtractCategoriesFromWebpage = async (
  webpage
) => {
  console.log("inside service: extractCategoriesFromWebpage: ", webpage.url);
  const webpageWithContent = await prisma.webpage.findFirstOrThrow({
    where: {
      id: webpage.id,
      content: {
        isNot: null,
      },
    },
    include: {
      content: true,
    },
  });
  if (webpageWithContent.content === null) {
    console.log(
      "aborting extractCategoriesFromWebpage as webpage has no content"
    );
    return [];
  }

  let cumulativeValues: string[] = [];

  // const dom = new JSDOM(webpageWithContent.content.desktopHtml);
  // const {
  //   window: { document },
  // } = dom;
  const document = parse(webpageWithContent.content.desktopHtml);

  const metaContentValues = [
    ...document.querySelectorAll(
      `meta[property='article:tag'], meta[property='article:section'], meta[property^="og:tax"]`
    ),
  ].map((x) => x.getAttribute("content") || "");
  console.log("metaContentValues: ", metaContentValues);
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
  console.log("categoryClasses: ", categoryClasses);
  cumulativeValues = cumulativeValues.concat(categoryClasses);

  const entryCategoryValues =
    document.querySelector(".entry-category")?.textContent?.split(",") || [];
  console.log("entryCategoryValues: ", entryCategoryValues);

  cumulativeValues = cumulativeValues.concat(entryCategoryValues);

  console.log("cumulativeValues: ", cumulativeValues);
  return cleanArray(cumulativeValues);
};

export default extractCategoriesFromWebpage;

if (require.main === module) {
  (async () => {
    const webpage = await prisma.webpage.findFirstOrThrow({
      where: {
        id: "cli3v2cbk000098q7nqb4mryo",
      },
    });
    const ans = await extractCategoriesFromWebpage(webpage);
    console.log("*** ans: ", ans);
  })();
}
