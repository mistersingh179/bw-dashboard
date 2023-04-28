import fetch from "node-fetch";
import { JSDOM } from "jsdom";
import UserAgent from "user-agents";

type FetchHtmlOfWebpage = (url: string) => Promise<string>;
const fetchHtmlOfWebpage: FetchHtmlOfWebpage = async (url) => {
  console.log("in fetchHtmlOfWebpage with: ", url);
  const userAgent = new UserAgent({ deviceCategory: "desktop" });
  const res = await fetch(url, {
    method: "GET",
    headers: {
      "Content-Type": "text/html",
      "User-Agent": userAgent.random().toString(),
    },
    redirect: "follow",
  });
  const data = await res.text()
  return data;
};

export default fetchHtmlOfWebpage;

if (require.main === module) {
  (async () => {
    const ans = await fetchHtmlOfWebpage(
      "https://www.simplyrecipes.com/recipes/homemade_pizza/"
    );
    console.log("ans: ", ans.substring(0, 100));

    const dom = new JSDOM(ans);
    const items = dom.window.document.querySelectorAll("p:nth-child(3n)");
    for (let i = 0; i < items.length; i++) {
      console.log(items[i].textContent);
      console.log(`\n--${i}--\n`);
    }
  })();
}
