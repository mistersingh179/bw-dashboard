import prisma from "@/lib/prisma";
import { parse } from "node-html-parser";
import { JSDOM } from "jsdom";

(async () => {
  const userId: string = "clhtwckif000098wp207rs2fg";

  const webpage = await prisma.webpage.findFirstOrThrow({
    where: {
      content: {
        isNot: null,
      },
    },
    include: {
      content: true,
    },
  });

  const dom = new JSDOM(webpage.content?.desktopHtml ?? "");
  const {
    window: { document },
  } = dom;
  const items = [...document.querySelectorAll("p")];
  console.log(items[0].constructor.name);

  const root = parse(webpage.content?.desktopHtml ?? "");
  const elements = root.querySelectorAll("body p:nth-child(3n)");
  console.log(elements[0].constructor.name);
})();

export {};
