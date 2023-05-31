import prisma from "@/lib/prisma";
import { parse } from "node-html-parser";
import { JSDOM } from "jsdom";
import helloWorldJob from "@/defer/helloWorldJob";
import { awaitResult } from "@defer/client";
import fetch from "node-fetch";
import UserAgent from "user-agents";

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
  console.log("starting");
  const userAgent = new UserAgent({ deviceCategory: "desktop" });
  const controller = new AbortController();
  const timeoutId = setTimeout(controller.abort, 10000);
  try {
    const res = await fetch("http://localhost:3000/api/ping", {
      headers: {
        "User-Agent": userAgent.random().toString(),
      },
      signal: controller.signal,
    });
    clearInterval(timeoutId);
    const data = await res.text();
    console.log("data: ", data);
  } catch (err: any) {
    console.log("unable to make fetch: ", err.name, err.message);
  }
  console.log("finished");
})();

export {};
