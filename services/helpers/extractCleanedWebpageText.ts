// import { JSDOM } from "jsdom";
import { parse, HTMLElement } from "node-html-parser";

import prisma from "@/lib/prisma";

/*
On average 1 word === 1.3 tokens
so 500 words will be 650 tokens
and chatGpt's limit is ~ 4096 tokens
 */

type ExtractCleanedWebpageText = (
  html: string,
  maxWordCount?: number
) => string;

const extractCleanedWebpageText: ExtractCleanedWebpageText = (
  html,
  maxWordCount = 500
) => {
  console.log("inside service: extractCleanedWebpageText");
  const document = parse(html);
  const body = document.querySelector("body");
  // const dom = new JSDOM(html);
  // const {
  //   window: {
  //     document: { body },
  //   },
  // } = dom;
  const cleanedContent =
    body?.textContent?.replaceAll(/[\n]+/g, " ").replaceAll(/[\s]+/g, " ") ??
    "";

  const words = cleanedContent.split(" ");
  const subsetContent = words.slice(0, maxWordCount).join(" ");

  console.log("cleaned webpage text: ", subsetContent);
  return subsetContent || "";
};

export default extractCleanedWebpageText;

if (require.main === module) {
  (async () => {
    // const ans = await extractCleanedWebpageText(
    //   "<body></body><div>foo<br/>\n\nbar\n\n   <br/>\n\nfoobar</div></body>"
    // );
    // console.log("*** ans: ", ans);
    const content = await prisma.content.findFirstOrThrow({
      where: {
        webpageId: "cli3v2cbk000098q7nqb4mryo"
      },
    });
    const ans2 = await extractCleanedWebpageText(content.desktopHtml, 5);
    console.log("*** ans2: ", ans2);
  })();
}
