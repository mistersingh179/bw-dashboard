import { Setting, Webpage } from "@prisma/client";
import prisma from "@/lib/prisma";
// import { JSDOM } from "jsdom";
import { parse, HTMLElement } from "node-html-parser";
import { Content } from ".prisma/client";
import logger from "@/lib/logger";

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

  // const dom = new JSDOM(webpageWithContent.content.desktopHtml);
  // const {
  //   window: { document },
  // } = dom;

  const document = parse(content.desktopHtml);
  let elements = document.querySelectorAll(settings.contentSelector);
  let elementsArr = [...elements];
  myLogger.info({ length: elementsArr.length }, "possible ad spots at start");

  elementsArr = elementsArr.filter(
    minCharFilter.bind(this, settings.minCharLimit)
  );
  myLogger.info({ length: elementsArr.length }, "ad spots after minCharLimit");

  elementsArr = settings.sameTypeElemWithTextToFollow
    ? elementsArr.filter(nextElementWithTextOfSameTypeFilter)
    : elementsArr;
  myLogger.info({ length: elementsArr.length }, "ad spots after sameTypeElem");

  elementsArr = elementsArr.slice(0, settings.desiredAdvertisementSpotCount);
  myLogger.info({ length: elementsArr.length }, "ad spots after desired count");

  const adSpots: AdSpotText[] = elementsArr.map((elem) => ({
    beforeText: elem.textContent?.trim() ?? "",
    afterText: nextWithText(elem)?.textContent?.trim() ?? "",
  }));

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
        id: "cliuttkba003598suxjdzu1f3",
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
