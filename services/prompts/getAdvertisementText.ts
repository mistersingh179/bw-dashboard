type GetAdvertisementText = (
  corpus: string,
  beforeText: string,
  afterText: string,
  brandName: string,
  brandDescription: string
) => Promise<string[]>;

// todo - take object here rather than so many params
const getAdvertisementText: GetAdvertisementText = async (
  corpus,
  beforeText: string,
  afterText: string,
  brandName,
  brandDescription
) => {
  // todo – call openai api here
  // limit corpus characters so the prompt fits

  return [
    `${brandName} is the best product. Please use it.`,
    `This is the best – ${brandName}.`,
    `${brandName} rocks because – ${brandDescription}`,
  ];
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
