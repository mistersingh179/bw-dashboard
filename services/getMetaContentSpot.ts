import logger from "@/lib/logger";
import { Webpage } from "@prisma/client";
import prisma from "@/lib/prisma";
import { JSDOM } from "jsdom";
import { Content } from ".prisma/client";
import {
  minCharFilter,
  nextElementWithTextOfSameTypeFilter,
} from "@/services/helpers/getAdSpotsForWebpage";
import Papa from "papaparse";
import fs from "fs";
import getMostVisitedUrls from "@/services/queries/getMostVisitedUrls";
import { startOfYesterday } from "date-fns";
import { getCleanUrl } from "@/helpers/getCleanUrl";

type ItemType = { url: string; input: string };

type GetMetaContentSpot = (
  webpage: Webpage,
  content: Content
) => Promise<ItemType[]>;

const myLogger = logger.child({ name: "getMetaContentSpot" });

const getMetaContentSpot: GetMetaContentSpot = async (webpage, content) => {
  myLogger.info({}, "inside service");
  const dom = new JSDOM(content.desktopHtml);
  const {
    window: { document },
  } = dom;

  let elements = document.querySelectorAll(".entry-content > p");
  let elementsArr = [...elements];
  myLogger.info(
    { length: elementsArr.length },
    "possible meta content spots at start"
  );

  elementsArr = elementsArr.filter(minCharFilter.bind(this, 50));
  myLogger.info(
    { length: elementsArr.length },
    "meta content spots after minCharLimit"
  );

  elementsArr = elementsArr.filter(nextElementWithTextOfSameTypeFilter);
  myLogger.info(
    { length: elementsArr.length },
    "meta content spots after sameTypeElem"
  );

  elementsArr = elementsArr.slice(0, 5);
  myLogger.info({ length: elementsArr.length }, "ad spots after desired count");

  const textArr: string[] = elementsArr.map((elem) => {
    let elemText = elem.textContent?.trim() ?? "";
    elemText = elemText.replaceAll(/[\n]+/g, " ");
    elemText = elemText.replaceAll(/[\s]+/g, " ");
    return elemText;
  });

  const data = textArr.reduce((previousValue, currentValue) => {
    return [
      ...previousValue,
      {
        url: getCleanUrl(webpage.url),
        input: currentValue,
      },
    ];
  }, [] as ItemType[]);

  return data;
};

export default getMetaContentSpot;

if (require.main === module) {
  (async () => {
    const urls = await getMostVisitedUrls(
      "clis07uvt01bdmq08xrjs15kf",
      100,
      startOfYesterday()
    );

    const webpages = await prisma.webpage.findMany({
      where: {
        url: {
          in: urls,
        },
        content: {
          isNot: null,
        },
      },
      include: {
        content: true,
      },
    });
    let ans: ItemType[] = [];
    for (const webpage of webpages) {
      const result = await getMetaContentSpot(webpage, webpage.content!);
      ans = ans.concat(result);
    }

    const output = Papa.unparse(ans, {});

    fs.writeFileSync("services/importExport/rod.csv", output, {});
    myLogger.info("*** done writing!!! ***");
    process.exit(0);
  })();
}
