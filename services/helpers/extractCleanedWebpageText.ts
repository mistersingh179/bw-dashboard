import { JSDOM } from "jsdom";
import { parse, HTMLElement } from "node-html-parser";
import prisma from "@/lib/prisma";
import logger from "@/lib/logger";
import { stripHtml } from "string-strip-html";

/*
On average 1 word === 1.3 tokens
so 500 words will be 650 tokens
and chatGpt's limit is ~ 4096 tokens
d */

const myLogger = logger.child({ name: "extractCleanedWebpageText" });

type ExtractCleanedWebpageText = (
  html: string,
  maxWordCount: number,
  mainPostBodySelector: string
) => string;

const extractCleanedWebpageText: ExtractCleanedWebpageText = (
  html,
  maxWordCount = 200,
  mainPostBodySelector = "body"
) => {
  myLogger.info({ length: html.length, maxWordCount }, "starting service");

  const dom = new JSDOM(html);
  const {
    window: { document },
  } = dom;

  // const document = parse(html);
  // const mainElement = document.querySelector(mainPostBodySelector);

  let mainElement =
    document.querySelector(mainPostBodySelector) ??
    document.querySelector("body");
  if (!mainElement) {
    myLogger.info(
      { mainPostBodySelector },
      "Aborting as body element also not found!"
    );
    return "";
  }

  // const mainElementText = mainElement.textContent ?? ""
  const mainElementText = stripHtml(mainElement.innerHTML).result ?? "";
  myLogger.debug({ mainElementText }, "main element text");

  const cleanedContent =
    mainElementText.replaceAll(/[\n]+/g, " ").replaceAll(/[\s]+/g, " ") ?? "";

  myLogger.debug(
    { cleanedContent, length: cleanedContent.length },
    "cleanedContent"
  );

  const words = cleanedContent.split(" ");
  const subsetWords = words.slice(0, maxWordCount);
  const subsetContent = subsetWords.join(" ");

  myLogger.info(
    {
      subsetContent,
      length: subsetContent.length,
      wordsCount: subsetWords.length,
      maxWordCount,
    },
    "final webpage text after extraction, filtering and cleaning"
  );

  return subsetContent || "";
};

export default extractCleanedWebpageText;

if (require.main === module) {
  (async () => {
    // const ans = await extractCleanedWebpageText(
    //   "<body></body><div>foo<br/>\n\nbar\n\n   <br/>\n\nfoobar</div></body>"
    // );
    // console.log("*** ans: ", ans);

    const webpage = await prisma.webpage.findFirstOrThrow({
      where: {
        id: "clj4mbowc0002982oo9xkjujr",
        // id: "clint6o2n001ymd08q6wl7xlh",
        // id: "clj4l8mbc0tx0ny1qthfjl55y",
        // id: "clim0ldkj029wmq08t01qppn4",
      },
    });
    console.log(webpage);

    const content = await prisma.content.findFirstOrThrow({
      where: {
        webpageId: webpage.id,
      },
    });
    console.log("got content: ", content.id);

    const ans = await extractCleanedWebpageText(
      content.desktopHtml,
      200,
      "main"
    );
    console.log("*** ans: ", ans);
    // console.log("***length: ", ans2.length);
  })();
}
