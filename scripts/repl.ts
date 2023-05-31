import prisma from "@/lib/prisma";
import { parse } from "node-html-parser";
import { JSDOM } from "jsdom";
import helloWorldJob from "@/defer/helloWorldJob";
import { awaitResult } from "@defer/client";

const foo = () => {
  return new Promise((resolve, reject) => {
    setTimeout(resolve, 1000);
  });
};

const bar = () => {
  return new Promise((resolve, reject) => {
    setTimeout(reject, 10);
  });
};

(async () => {
  const ans = await prisma.setting.findFirstOrThrow({
    where: {
      user: {
        websites: {
          some: {
            webpages: {
              some: {
                id: "cli38233j000098m9ug7e78m7"
              }
            }
          }
        }
      }
    }
  })
  console.log(ans)
})();

export {};
