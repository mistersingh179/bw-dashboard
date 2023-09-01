import { Setting, Webpage } from "@prisma/client";
import prisma from "@/lib/prisma";
import { JSDOM } from "jsdom";
import { Content } from ".prisma/client";
import logger from "@/lib/logger";
import getWordCount from "@/lib/getWordCount";

export const minWordFilter = (minWordLimit: number, elem: HTMLElement | Element) => {
  let textContent = "";
  if (elem.textContent) {
    textContent = elem.textContent.trim();
  }
  const wordCount = getWordCount(textContent)
  const ans = wordCount >= minWordLimit;
  if (ans) {
    myLogger.info({ length: textContent.length, minWordLimit }, "keeping");
  } else {
    myLogger.info(
      { length: textContent.length, minWordLimit },
      "rejecting"
    );
  }
  return ans;
};

const myLogger = logger.child({ name: "getAdSpotsForWebpage" });

type GetMetaContentSpotsTextForWebpage = (
  webpage: Webpage,
  content: Content,
  settings: Setting
) => Promise<string[]>;

const getMetaContentSpotsForWebpage: GetMetaContentSpotsTextForWebpage = async (
  webpage,
  content,
  settings
) => {
  myLogger.info({ url: webpage.url }, "starting service");

  const dom = new JSDOM(content.desktopHtml);
  const {
    window: { document },
  } = dom;

  let elements = document.querySelectorAll(settings.metaContentSelector);
  let elementsArr = [...elements];
  myLogger.info({ length: elementsArr.length }, "possible meta content spots at start");

  elementsArr = elementsArr.filter(
    minWordFilter.bind(this, settings.minMetaContentSpotWordLimit)
  );
  myLogger.info({ length: elementsArr.length }, "meta content spots after minWordFilter");

  elementsArr = elementsArr.slice(0, settings.desiredMetaContentSpotCount);
  myLogger.info({ length: elementsArr.length }, "meta content spots after desired count");

  const contentTexts: string[] = elementsArr.map(elem => {
    let elemText = elem.textContent?.trim() ?? "";
    elemText = elemText.replaceAll(/[\n]+/g, " ");
    elemText = elemText.replaceAll(/[\s]+/g, " ");
    return elemText;
  });

  contentTexts.forEach((contentText, index, array) => {
    myLogger.info(
      { index, contentText },
      "generated meta content spot"
    );
  });

  return contentTexts;
};

export default getMetaContentSpotsForWebpage;

if (require.main === module) {
  (async () => {
    const webpage = await prisma.webpage.findFirstOrThrow({
      where: {
        id: "clkrey0jx000m985gb765ieg0",
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
    await getMetaContentSpotsForWebpage(
      webpage,
      webpage.content!,
      webpage.website.user.setting!
    );
  })();
}
