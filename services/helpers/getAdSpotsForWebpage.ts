import { Setting, Webpage } from "@prisma/client";
import prisma from "@/lib/prisma";
import { JSDOM } from "jsdom";
// import { parse, HTMLElement } from "node-html-parser";
import { Content } from ".prisma/client";
import logger from "@/lib/logger";
import getWordCount from "@/lib/getWordCount";

type AdSpotText = {
  beforeText: string;
  afterText: string;
};

type ElementFilter = (elem: HTMLElement | Element) => Boolean;

const siblingTextLogger = logger.child({ name: "siblingText" });
const siblingTextMaxWordCount = 150;
const siblingText = (
  el: HTMLElement | Element,
  totalText = "",
  direction: string
): string => {
  if (getWordCount(totalText) >= siblingTextMaxWordCount) {
    if(direction === "previous"){
      totalText = totalText.split(" ").slice(-siblingTextMaxWordCount).join(" ");
    }else{
      totalText = totalText.split(" ").slice(0,siblingTextMaxWordCount).join(" ");
    }

    siblingTextLogger.info(
      { length: totalText.length },
      "stopping as reached size limit"
    );
    return totalText;
  }

  if (totalText == "" && direction == "previous") {
    let elemText = el.textContent?.trim() ?? "";
    elemText = elemText.replaceAll(/[\n]+/g, " ");
    elemText = elemText.replaceAll(/[\s]+/g, " ");
    totalText = elemText;
  }

  const siblingElem =
    direction === "next" ? el.nextElementSibling : el.previousElementSibling;
  if (siblingElem == null) {
    siblingTextLogger.info("stopping as sibling element is null");
    return totalText;
  } else {
    if (siblingElem.textContent) {
      let siblingText = siblingElem.textContent.trim() ?? "";
      siblingText = siblingText.replaceAll(/[\n]+/g, " ");
      siblingText = siblingText.replaceAll(/[\s]+/g, " ");
      if (siblingText.length > 0) {
        if (direction === "next") {
          if (totalText == "") {
            totalText = siblingText;
          } else {
            totalText = totalText + " \n " + siblingText;
          }
        } else {
          if (totalText == "") {
            totalText = siblingText;
          } else {
            totalText = siblingText + " \n " + totalText;
          }
        }
      }
    }
    return siblingText(siblingElem, totalText, direction);
  }
};

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
    myLogger.info({ length: elem.textContent.length, minCharLimit }, "keeping");
  } else {
    myLogger.info(
      { length: elem.textContent.length, minCharLimit },
      "rejecting"
    );
  }
  return ans;
};

const nextElementWithTextOfSameTypeFilter: ElementFilter = (elem) => {
  const fElem = nextWithText(elem);
  const ans = fElem?.tagName === elem.tagName;
  if (ans) {
    myLogger.info(
      { tagName: elem.tagName, fTagName: fElem?.tagName },
      "keeping"
    );
  } else {
    myLogger.info(
      { tagName: elem.tagName, fTagName: fElem?.tagName },
      "rejecting"
    );
  }
  return ans;
};

const myLogger = logger.child({ name: "getAdSpotsForWebpage" });

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
  myLogger.info({ url: webpage.url }, "starting service");

  const dom = new JSDOM(content.desktopHtml);
  const {
    window: { document },
  } = dom;

  // const document = parse(content.desktopHtml);
  let elements = document.querySelectorAll(settings.contentSelector);
  let elementsArr = [...elements];
  myLogger.info({ length: elementsArr.length }, "possible ad spots at start");

  elementsArr = elementsArr.filter(
    minCharFilter.bind(this, settings.minCharLimit)
  );
  myLogger.info({ length: elementsArr.length }, "ad spots after minCharLimit");

  myLogger.info(
    { sameTypeElemWithTextToFollow: settings.sameTypeElemWithTextToFollow },
    "sameTypeElemWithTextToFollow"
  );

  elementsArr = settings.sameTypeElemWithTextToFollow
    ? elementsArr.filter(nextElementWithTextOfSameTypeFilter)
    : elementsArr;
  myLogger.info({ length: elementsArr.length }, "ad spots after sameTypeElem");

  elementsArr = elementsArr.slice(0, settings.desiredAdvertisementSpotCount);
  myLogger.info({ length: elementsArr.length }, "ad spots after desired count");

  const adSpots: AdSpotText[] = elementsArr.map((elem) => {
    const beforeText = siblingText(elem, "", "previous") ?? "";
    const afterText = siblingText(elem, "", "next") ?? "";

    return {
      beforeText,
      afterText,
    };
  });

  adSpots.forEach((elem, index, array) => {
    myLogger.info(
      { index, before: elem.beforeText, after: elem.afterText },
      "generated ad spot"
    );
  });

  return adSpots;
};

export default getAdSpotsForWebpage;

if (require.main === module) {
  (async () => {
    const webpage = await prisma.webpage.findFirstOrThrow({
      where: {
        id: "clj75tm7a000098koa8bhduex",
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
    await getAdSpotsForWebpage(
      webpage,
      webpage.content!,
      webpage.website.user.setting!
    );
  })();
}
