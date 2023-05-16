import { JSDOM } from "jsdom";

type ExtractCleanedWebpageText = (
  html: string,
  maxLength?: number
) => string;

const extractCleanedWebpageText: ExtractCleanedWebpageText = (
  html,
  maxLength = 5000
) => {
  console.log("inside service: extractCleanedWebpageText");
  const dom = new JSDOM(html);
  const {
    window: {
      document: { body },
    },
  } = dom;
  const cleanedHtml = body.textContent
    ?.replaceAll(/[\n]+/g, " ")
    .replaceAll(/[\s]+/g, " ")
    .substring(0, maxLength);

  console.log("cleanedHtml: ", cleanedHtml);
  return cleanedHtml || "";
};

export default extractCleanedWebpageText;

if (require.main === module) {
  (async () => {
    const ans = await extractCleanedWebpageText(
      "<div>foo<br/>\n\nbar\n\n   <br/>\n\nfoobar</div>"
    );
    console.log("*** ans: ", ans);
  })();
}
