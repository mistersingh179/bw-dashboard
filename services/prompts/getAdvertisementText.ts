import { DESIRED_ADVERTISEMENT_COUNT } from "@/constants";
import AnyObject from "@/types/AnyObject";
import fetch from "node-fetch";
import prisma from "@/lib/prisma";
import extractCleanedWebpageText from "@/services/helpers/extractCleanedWebpageText";
import { CreateChatCompletionResponse } from "openai/api";

type GetAdvertisementText = (
  html: string,
  beforeText: string,
  afterText: string,
  productName: string,
  productDescription: string,
  addSponsoredWording: boolean
) => Promise<string[]>;

const getAdvertisementText: GetAdvertisementText = async (
  html,
  beforeText,
  afterText,
  productName,
  productDescription,
  addSponsoredWording
) => {
  if (process.env.NODE_ENV === "development") {
    return [
      `Ad Copy 1 for ${productName}, ${productDescription}`,
      `Ad Copy 2 for ${productName}, ${productDescription}`,
      `Ad Copy 3 for ${productName}, ${productDescription}`,
    ];
  }

  const sponsoredWordingInstruction: string = addSponsoredWording
    ? "Inside the new paragraph also subtly let the reader know that this paragraph is sponsored content. "
    : "";

  const messages: AnyObject[] = [
    {
      role: "system",
      content: `You are a blog's advertisement editor whose job is to naturally include \
branded product placements into blog posts.`,
    },
    {
      role: "user",
      content: `For context here is the blog which you will be working on: ${html} \n\n\
Write a new paragraph which subtly includes the brand, ${productName}. \
${sponsoredWordingInstruction} \
Here is the brands description: ${productDescription} \
You can use the brands description for inspiration on making the advertisement for the brand. \
This new advertisement paragraph which you create will be inserted between 2 existing paragraphs of the blog. \
You must make sure that the new advertisement paragraph you create seamlessly connects to the paragraph before and after it. \
Here is the paragraph which will come before the advertisement you create: ${beforeText} \
and here is the paragraph which will come after the advertisement you create: ${afterText} \
Remember these important rules: \
Your new advertisement paragraph must follow the same writing style as the blog post. \
Your new advertisement paragraph should feel like the author of the blog post wrote it. \
Importantly, do not make factual assertions about the brand. \
Limit the advertisement paragraph you create to a maximum of 4 sentences. \
You cannot make factual assertions about the brand. \
Do not change the intent or meaning of the blog post. \
Do not make it seem like the author is endorsing the brand. \
Do not make it seem like the brand is endorsing the content of the article. \
Never portray the brand in a negative context. \
In your reply, just provide the new paragraph.`,
    },
  ];

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: "gpt-3.5-turbo-0301",
      temperature: 1,
      n: DESIRED_ADVERTISEMENT_COUNT,
      max_tokens: 1000,
      messages: messages,
    }),
  });
  let data = (await response.json()) as CreateChatCompletionResponse;
  console.log("api returned: ");
  console.dir(data, { depth: null, colors: true });
  const output = data.choices.map((c) => c.message?.content || "");
  console.log("output is: ", output);
  return output;
};

export default getAdvertisementText;

if (require.main === module) {
  (async () => {
    const webpage = await prisma.webpage.findFirstOrThrow({
      where: {
        id: "clhuouuc4000798p2c5fr1xbt",
        content: {
          isNot: null,
        },
        advertisementSpots: {
          some: {},
        },
      },
      include: {
        content: true,
        advertisementSpots: true,
      },
    });
    const campaign = await prisma.campaign.findFirstOrThrow({
      where: {
        id: "clhtx8jj2000i98wp09vkdc1i",
      },
    });
    const ans = await getAdvertisementText(
      extractCleanedWebpageText(webpage.content?.desktopHtml || ""),
      webpage.advertisementSpots[0].beforeText,
      webpage.advertisementSpots[0].afterText,
      campaign.productName,
      campaign.productDescription,
      false
    );
    console.log("ans: ", ans);
  })();
}
