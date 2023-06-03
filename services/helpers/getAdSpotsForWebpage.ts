import { Setting, Webpage } from "@prisma/client";
import prisma from "@/lib/prisma";
// import { JSDOM } from "jsdom";
import { parse, HTMLElement } from "node-html-parser";
import { Content } from ".prisma/client";

type AdSpotText = {
  beforeText: string;
  afterText: string;
};

type ElementFilter = (elem: HTMLElement | Element) => Boolean;

export const nextWithText = (
  el: HTMLElement | Element
): null | HTMLElement | Element => {
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

const minCharFilter = (minCharLimit: number, elem: HTMLElement | Element) => {
  if (!elem.textContent) {
    elem.textContent = "";
  }
  const ans = elem.textContent.length >= minCharLimit;
  if (ans) {
    console.log("keeping: ", elem.textContent.length, minCharLimit);
  } else {
    console.log("rejecting: ", elem.textContent.length, minCharLimit);
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

type GetAdSpotsTextForWebpage = (
  webpage: Webpage,
  content: Content,
  settings: Setting
) => Promise<AdSpotText[]>;

const getAdSpotsForWebpage: GetAdSpotsTextForWebpage = async (
  webpage,
  content,
  settings
) => {

  // const dom = new JSDOM(webpageWithContent.content.desktopHtml);
  // const {
  //   window: { document },
  // } = dom;

  const document = parse(content.desktopHtml);
  let elements = document.querySelectorAll(settings.contentSelector);
  let elementsArr = [...elements];
  elementsArr = elementsArr.filter(
    minCharFilter.bind(this, settings.minCharLimit)
  );
  elementsArr = settings.sameTypeElemWithTextToFollow
    ? elementsArr.filter(nextElementWithTextOfSameTypeFilter)
    : elementsArr;
  elementsArr = elementsArr.slice(0, settings.desiredAdvertisementSpotCount);
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
          isNot: null,
        },
      },
      include: {
        website: {
          include: {
            user: {
              include: {
                setting: true,
              },
            },
          },
        },
        content: true,
        _count: {
          select: {
            categories: true,
            advertisementSpots: true,
            scoredCampaigns: true,
          },
        },
      },
    });
    await getAdSpotsForWebpage(webpage, webpage.content!, webpage.website.user.setting!);
  })();
}
