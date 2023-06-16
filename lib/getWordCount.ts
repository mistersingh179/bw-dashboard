const getWordCount = (input: string): number => {
  const cleanedContent =
    input.replaceAll(/[\n]+/g, " ").replaceAll(/[\s]+/g, " ") ?? "";
  const words = cleanedContent.split(" ");
  return words.length;
};

export default getWordCount;

if (require.main === module) {
  (async () => {
    const input =
      " \n Simply Recipes / Annika Panikker \n How To Make Sure Your Yeast Is Active \n Pizza dough is a yeasted dough that requires active dry yeast. Make sure the check the expiration date on the yeast package! Yeast that is too old may be dead and won't work. \n Also, if the yeast does not begin to foam or bloom within 10 minutes of being added to the water in Step 1 of Making the Pizza Dough, it is probably dead. You'll need to start over with new, active yeast. \n How To Measure Flour for This Pizza Dough Recipe \n Cup measurements can vary depending on how you are scooping the flour (we fluff the flour, lightly scoop it, and level with a knife). So I recommend using a kitchen scale to measure out the flour amounts by weight. This is the only way you'll get a consistently accurate measurement.";
    const output = getWordCount(input);
    console.log("***input: ", input);
    console.log("***ans: ", output);
  })();
}
