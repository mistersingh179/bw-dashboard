import fetch from "node-fetch";
// import { JSDOM } from "jsdom";
import { parse, HTMLElement } from "node-html-parser";
import UserAgent from "user-agents";
import { FETCH_TIMEOUT } from "@/constants";

type FetchContentOfWebpage = (
  url: string,
  accept?: string,
  deviceCategory?: string
) => Promise<string>;

const fetchContentOfWebpage: FetchContentOfWebpage = async (
  url,
  accept = "*/*",
  deviceCategory = "desktop"
) => {
  console.log("in fetchContentOfWebpage with: ", url);
  const userAgent = new UserAgent({ deviceCategory });
  const controller = new AbortController();
  const timeoutId = setTimeout(controller.abort, FETCH_TIMEOUT);
  const res = await fetch(url, {
    method: "GET",
    headers: {
      Accept: accept,
      "User-Agent": userAgent.random().toString(),
    },
    redirect: "follow",
    signal: controller.signal,
  });
  clearTimeout(timeoutId);
  const data = await res.text();
  return data;
};

export default fetchContentOfWebpage;

if (require.main === module) {
  (async () => {
    const ans = await fetchContentOfWebpage(
      "https://www.simplyrecipes.com/recipes/homemade_pizza/"
    );
    console.log("ans: ", ans.substring(0, 100));

    // const dom = new (ans);
    // const items = dom.window.document.querySelectorAll("p:nth-child(3n)");
    const document = parse(ans);
    const items = document.querySelectorAll("p:nth-child(3n)");
    for (let i = 0; i < items.length; i++) {
      console.log(items[i].textContent);
      console.log(`\n--${i}--\n`);
    }
  })();
}
