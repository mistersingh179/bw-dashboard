import {DESIRED_ADVERTISEMENT_COUNT} from "@/constants";

type GetAdvertisementText = (
  corpus: string,
  beforeText: string,
  afterText: string,
  productName: string,
  productDescription: string
) => Promise<string[]>;

// todo - take object here rather than so many params
const getAdvertisementText: GetAdvertisementText = async (
  corpus,
  beforeText: string,
  afterText: string,
  productName,
  productDescription
) => {
  // todo – call openai chat gpt api here
  // limit corpus characters so the prompt fits

  return [
    `${productName} is the best product. Please use it.`,
    `This is the best – ${productName}.`,
    `${productName} rocks because – ${productDescription}`,
    `always use ${productName} as – ${productDescription}`,
    `i trust ${productName} period. It is ${productDescription}`
  ].slice(0, DESIRED_ADVERTISEMENT_COUNT);
};

export default getAdvertisementText;

if (require.main === module) {
  (async () => {
    const ans = getAdvertisementText(
      "Lorem Lipsum",
      "Foo",
      "Bar",
      "Tide",
      "Best soap company"
    );
    console.log("ans: ", ans);
  })();
}
