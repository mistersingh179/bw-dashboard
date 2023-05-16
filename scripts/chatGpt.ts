import fetch from "node-fetch";
import { config } from "dotenv";
import AnyObject from "@/types/AnyObject";
import prisma from "@/lib/prisma";
import { JSDOM } from "jsdom";
import Papa from "papaparse";

config();

type CampaignWithScore = {
  id: string,
  name: string,
  description?: string,
  score?: number | "?",
  reason?: string,
}

// given a webpages content
// given a bunch of campaigns
// rate each campaigns relevancy on a scale of 0 to 4
// pass in existing campaigns and rating
// 0 - irrelevant
// 1 - less relevant
// 2 - relevant
// 3 - more relevant
// 4 - extremely relevant
(async () => {
  console.log("in script chatGpt");
  const webpage = await prisma.webpage.findFirstOrThrow({
    where: {
      id: "clh9d58tw000198c0g5kfluac",
      content: {
        isNot: null,
      },
    },
    include: {
      content: true,
      website: {
        include: {
          user: {
            include: {
              campaigns: true,
            },
          },
        },
      },
    },
  });
  if (!webpage.content) {
    console.log("aborting as webpage has no content");
    return;
  }
  const dom = new JSDOM(webpage.content.desktopHtml);
  const {
    window: {
      document: { body },
    },
  } = dom;
  const webpageText = body.textContent
    ?.replaceAll(/[\n]+/g, " ")
    .replaceAll(/[\s]+/g, " ")
    .substring(0, 5000);

  console.log("webpageText: ", webpageText);

  const campaignsWithScore: CampaignWithScore[] = webpage.website.user.campaigns.map((c) => ({
    id: c.id,
    name: c.productName,
    description: c.productDescription,
    "score": "?",
    "reason": "?",
  }))

  const campaignsCsv = Papa.unparse(campaignsWithScore);
  console.log("campaignsCsv: ", campaignsCsv);

  const { OPENAI_API_KEY } = process.env;
  const messages: AnyObject[] = [
    {
      role: "system",
      content: "You are a publishing website's advertisement editor.",
    },
    {
      role: "user",
      content:
        `Below you are provided with a webpage's content and a csv list of ` +
        `products which can be advertised on this page. ` +
        `The csv includes many fields describing each product along with a ` +
        `score field which is unknown and marked with a question mark.` +
        `Your job is to score each product with a number between 0 and 4 where ` +
        `a higher rating is given to products which are highly relevant to the ` +
        `webpage's content, are more likely to be read by the webpage's reader and ` +
        `clicked on by the reader of the webpage. ` +
        `On the hand a lower score is given to products which are less relevant ` +
        `to the webpage's content and more likely to be ignored by the reader, ` +
        `offend the reader or not be clicked on by the reader of the webpage. ` +
        `Along with score, also provide a brief reason in less than 3 sentences `+
        `which explains why you think the product is relevant or irrelevant and thus give the score you gave it` +
        `Here is the content of the website: ${webpageText
          ?.replace("\n", "")
          .substring(0, 20000)}` +
        ` Here is the csv list of products: ${campaignsCsv} ` +
        `For your result give me back a csv list similar to what is provided ` +
        `to you. In the csv only include the product's id, name, score and reason column. Put the reason in quotes so it does not break csv format.`,
    },
  ];
  // console.log("input messages: ", messages);
  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: "gpt-3.5-turbo-0301",
      temperature: 1,
      n: 1,
      max_tokens: 500,
      messages: messages,
    }),
  });
  let data = await response.json();
  console.log("api returned: ")
  console.dir(data, { depth: null, colors: true });
  const ans = (data as AnyObject).choices[0].message.content;
  console.log("ans is: ", ans);

  const ansObj = Papa.parse<CampaignWithScore>(ans, {
    header: true
  });
  console.log("ansObj is: ", ansObj);

})();

export {};
