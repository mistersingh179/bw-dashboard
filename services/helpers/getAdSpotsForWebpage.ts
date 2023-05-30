import { Webpage } from "@prisma/client";
import prisma from "@/lib/prisma";
// import { JSDOM } from "jsdom";
import { parse, HTMLElement } from 'node-html-parser';
import { DESIRED_ADVERTISEMENT_SPOT_COUNT } from "@/constants";

type AdSpotText = {
  beforeText: string;
  afterText: string;
};

type GetAdSpotsTextForWebpage = (webpage: Webpage) => Promise<AdSpotText[]>;

type AdSelectionOptions = {
  contentSelector: string;
  count: number;
  minCharLimit: number;
  sameTypeElemWithTextToFollow: true;
};

const defaultAdSelectionOptions: AdSelectionOptions = {
  contentSelector: "body p:nth-child(3n)",
  count: DESIRED_ADVERTISEMENT_SPOT_COUNT,
  minCharLimit: 20,
  sameTypeElemWithTextToFollow: true,
};

const { contentSelector, count, minCharLimit, sameTypeElemWithTextToFollow } =
  defaultAdSelectionOptions;

type ElementFilter = (elem: HTMLElement | Element) => Boolean;

export const nextWithText = (el: HTMLElement | Element): null | HTMLElement | Element => {
  const nextEl = el.nextElementSibling;
  if (!nextEl) {
    return null;
  }
  if (nextEl.textContent && nextEl.textContent.trim().length > 0) {
    return nextEl;
  } else {
    return nextWithText(nextEl);
  }
};

const minCharFilter: ElementFilter = (elem) => {
  if (!elem.textContent) {
    elem.textContent = "";
  }
  const ans = elem.textContent.length >= minCharLimit;
  if (ans) {
    console.log("keeping: ", elem, elem.textContent.length, minCharLimit);
  } else {
    console.log("rejecting: ", elem, elem.textContent.length, minCharLimit);
  }
  return ans;
};

const nextElementWithTextOfSameTypeFilter: ElementFilter = (elem) => {
  const followingElement = nextWithText(elem);
  const ans = followingElement?.tagName === elem.tagName;
  if (ans) {
    console.log("keeping: ", elem.tagName, followingElement?.tagName);
  } else {
    console.log("rejecting: ", elem.tagName, followingElement?.tagName);
  }
  return ans;
};
const getAdSpotsForWebpage: GetAdSpotsTextForWebpage = async (webpage) => {
  const webpageWithContent = await prisma.webpage.findFirstOrThrow({
    where: {
      id: webpage.id,
    },
    include: {
      content: true,
    },
  });
  if (webpageWithContent.content === null) {
    console.log("aborting getAdSpotsForWebpage as there is no content");
    return [];
  }
  // const dom = new JSDOM(webpageWithContent.content.desktopHtml);
  // const {
  //   window: { document },
  // } = dom;
  const document = parse(webpageWithContent.content.desktopHtml);
  let elements = document.querySelectorAll(contentSelector);
  let elementsArr = [...elements];
  elementsArr = elementsArr.filter(minCharFilter);
  elementsArr = sameTypeElemWithTextToFollow
    ? elementsArr.filter(nextElementWithTextOfSameTypeFilter)
    : elementsArr;
  elementsArr = elementsArr.slice(0, count);
  console.log(`here are the possible ${elementsArr.length} ad spots: `);
  const adSpots: AdSpotText[] = elementsArr.map((elem) => ({
    beforeText: elem.textContent?.trim() ?? "",
    afterText: nextWithText(elem)?.textContent?.trim() ?? "",
  }));

  adSpots.forEach((elem, index, array) => {
    console.group(`Ad ${index}`);
    console.log("Before Elem: ", elem.beforeText);
    console.log("After Elem: ", elem.afterText);
    console.groupEnd();
  });

  return adSpots;
};

export default getAdSpotsForWebpage;

if (require.main === module) {
  (async () => {
    const webpage = await prisma.webpage.findFirstOrThrow({
      where: {
        id: "cli3v2cbk000098q7nqb4mryo",
        content: {
          isNot: null
        }
      },
      include: {
        content: true
      }
    });
    await getAdSpotsForWebpage(webpage);
  })();
}
