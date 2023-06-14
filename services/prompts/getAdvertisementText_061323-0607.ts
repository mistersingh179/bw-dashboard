import { CHAT_GPT_FETCH_TIMEOUT } from "@/constants";
import AnyObject from "@/types/AnyObject";
import fetch from "node-fetch";
import prisma from "@/lib/prisma";
import extractCleanedWebpageText from "@/services/helpers/extractCleanedWebpageText";
import { CreateChatCompletionResponse } from "openai/api";
import { config } from "dotenv";
config();

type GetAdvertisementText = (
  html: string,
  beforeText: string,
  afterText: string,
  productName: string,
  productDescription: string,
  addSponsoredWording: boolean,
  desiredAdvertisementCount: number
) => Promise<string[]>;

const getAdvertisementText: GetAdvertisementText = async (
  html,
  beforeText,
  afterText,
  productName,
  productDescription,
  addSponsoredWording,
  desiredAdvertisementCount
) => {
  
  // if (process.env.NODE_ENV === "development") {
  //   return [
  //     `Ad Copy 1 for ${productName}, ${productDescription}`,
  //     `Ad Copy 2 for ${productName}, ${productDescription}`,
  //     `Ad Copy 3 for ${productName}, ${productDescription}`,
  //   ].splice(0, desiredAdvertisementCount);
  // }

  const sponsoredWordingInstruction: string = addSponsoredWording
    ? "• Let the reader know that this sponsored content is brought to you by PRODUCT_INFO.\n\ "
    : "";

  const messages: AnyObject[] = [
    {
      role: "system",
      content: `You are a content commerce editor, and your job is to place \
products into articles such that readers will feel positively about the product. \
You must write a new paragraph in between existing content of an article. \ 
To accomplish your task, you will receive \
content that goes before your new paragraph (labeled BEFORE_CONTENT), \
content that goes after your new paragraph (labeled AFTER_CONTENT), \
a product name and description (labeled PRODUCT_INFO), and \
important rules that you must follow. `,
    },
    {
      role: "user",
      content: `BEFORE_CONTENT:\n${beforeText} \n\
~~~\n\
AFTER_CONTENT:\n${afterText} \n\
~~~\n\
PRODUCT_INFO:\n${productDescription} \n\
~~~\n\
Follow these important rules:\n\
• Review the BEFORE_CONTENT and AFTER_CONTENT to understand the flow of the article. \n\
• Use a bridge sentence that introduces new information related to the BEFORE_CONTENT without repeating phrases therefrom. \n\
• Utilize a transition sentence to smoothly connect your paragraph to the AFTER_CONTENT, maintaining coherence without duplicating phrases therefrom. \n\
• Use language that is distinct and different from BEFORE_CONTENT and AFTER_CONTENT to maintain a unique perspective.\n\
• Provide speculative statements when referencing people, places, or things from the BEFORE_CONTENT or AFTER_CONTENT, using hedge words (like possibly, perhaps, probably, could, would, etc.) to avoid factual assertions.\n\
• Ensure that the product placement is subtle and integrates naturally into the article, avoiding advertising or sales-oriented language.\n\
• Keep your paragraph concise and restrict it to no more than 2 sentences.\n\
• Your answer must include the new paragraph only. Stop generating if you output two consecutive newlines, such as '\\n\\n'. \n\
• Maintain a clear separation between the author's viewpoint and the product, ensuring there is no implication of endorsement in either direction.\n\
• Present the product in a positive light, highlighting its beneficial aspects without any negative portrayal.\n\
${sponsoredWordingInstruction}`,
    },
  ];

  console.log("messages: ", messages)

  let response;
  const controller = new AbortController();
  const timeoutId = setTimeout(controller.abort, CHAT_GPT_FETCH_TIMEOUT);
  try {
    response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-3.5-turbo-0301",
        temperature: 0,
        n: 1,
        max_tokens: 1000,
        messages: messages,
      }),
      signal: controller.signal,
    });
  } catch (err) {
    console.log("got error while get advertisemenet from chatGpt: ", err);
    return [];
  }
  clearTimeout(timeoutId);

  let data = (await response.json()) as CreateChatCompletionResponse;
  console.log("api returned: ");
  console.dir(data, { depth: null, colors: true });
  const output = data.choices.map((c) => c.message?.content || "");
  // console.log("output is: ", output);
  return output;
};

export default getAdvertisementText;

if (require.main === module) {
  (async () => {
    const webpage = await prisma.webpage.findFirstOrThrow({
      where: {
        id: "clingq5pc04q8mq08os15nlyo", // Jericho & Michaels
        // id: "clinfv68f0250mc08y1gxbihw", // MMA Regian
        // id: "clim0ldkj029wmq08t01qppn4", // The Enterprise
        // id: "cliooewdn01a0mu08lt3vosi8", // aSweatLife 
        // id: "clis18sxz02hsl008p72d9ud5", // styleCraze 
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
        id: "clikk83eb01icla081zsv35jn", // Buck Bars
        // id: "clionywvy00y8jy081uuoibm5", // Phocus drink
        // id: "clikewt1100aqjp08g151drx1", // Wilson Flowers
        // id: "clikox1l200pkmf08z5kybz3m", // 1800Flowers
        // id: "clis06zxa058mml08olauk2j0", // Mario Badescu
        // id: "clioo13ii00mmjx08qnpa83s8", // Puma Shoes
      },
    });
    const ans = await getAdvertisementText(
      // extractCleanedWebpageText(webpage.content?.desktopHtml || ""),
      "",
      webpage.advertisementSpots[0].beforeText,
      // "Let’s start at the very beginning. When Shawn Michaels returned at SummerSlam in 2002 to face Triple H in a Street Fight, the match was initially expected to be a one-off. One of the prominent influencers in Shawn’s ear suggesting that he compete on a permanent basis was Chris Jericho, a man who idolized the Heartbreak Kid. As for Jericho, he was already an Undisputed Champion, a main eventer and arguably at the prime of his career trajectory within the company. His career prospects were brighter than ever before.",
      webpage.advertisementSpots[0].afterText,
      // "Heading into 2003, Chris Jericho became obsessed with ending the career of Shawn Michaels and ultimately proving he was the superior talent. He believed father time had past Shawn by and being of the King of the World, this was Jericho’s era. We fast forward to January 13, 2003. During an episode of Raw, Jericho won an over-the-top-rope challenge where he could pick his spot in the Royal Rumble. He chose entry Number Two while Shawn Michaels was the first entry. The ultimate test against his hero.",
      campaign.productName,
      campaign.productDescription,
      false,
      1
    );
    console.log(webpage.advertisementSpots[0].beforeText, "\n", ans, "\n", webpage.advertisementSpots[0].afterText);
  })();
}
