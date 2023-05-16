import { Campaign, Webpage } from "@prisma/client";
import prisma from "@/lib/prisma";
import { JSDOM } from "jsdom";
import Papa from "papaparse";
import AnyObject from "@/types/AnyObject";
import fetch from "node-fetch";
import extractCleanedWebpageText from "@/services/helpers/extractCleanedWebpageText";
import { CreateChatCompletionResponse } from "openai/api";

type CampaignProductWithScore = {
  id: string;
  name: string;
  description?: string;
  score?: string;
  scoreAsNum?: number;
  reason?: string;
};

type GetCampaignsWithTheirScores = (
  webpage: Webpage
) => Promise<CampaignProductWithScore[]>;

const getCampaignsWithTheirScores: GetCampaignsWithTheirScores = async (
  webpage
) => {
  const webpageWithDetails = await prisma.webpage.findFirstOrThrow({
    where: {
      id: webpage.id,
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
  if (!webpageWithDetails.content) {
    console.log("aborting as webpage has no content");
    return [];
  }

  const webpageText = extractCleanedWebpageText(
    webpageWithDetails.content.desktopHtml
  );

  console.log("webpageText: ", webpageText);

  const campaignsWithScore: CampaignProductWithScore[] =
    webpageWithDetails.website.user.campaigns.map((c) => ({
      id: c.id,
      name: c.productName,
      description: c.productDescription,
      score: "?",
      reason: "?",
    }));

  const campaignsCsv = Papa.unparse(campaignsWithScore);

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
        `Along with score, also provide a brief reason in less than 3 sentences ` +
        `which explains why you think the product is relevant or irrelevant and which lead to the score you assigned.` +
        `Here is the content of the website: ${webpageText}` +
        ` Here is the csv list of products: ${campaignsCsv} ` +
        `For your result give me back a csv list similar to what is provided ` +
        `to you. In the csv only include the product's id, name, score and reason column. Put the reason in quotes so it does not break csv format.`,
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
      n: 1,
      max_tokens: 500,
      messages: messages,
    }),
  });
  let data = (await response.json()) as CreateChatCompletionResponse;
  console.log("api returned: ");
  console.dir(data, { depth: null, colors: true });

  const output = data.choices[0]?.message?.content || "";
  console.log("output is: ", output);

  const outputObj = Papa.parse<CampaignProductWithScore>(output, {
    header: true,
  });
  console.log("outputObj is: ", outputObj.data);

  console.log("return with campaigns with scores: ", outputObj.data);

  const ans: CampaignProductWithScore[] = outputObj.data.map((c) => {
    let scoreAsNum = parseInt(c.score || "");
    if (isNaN(scoreAsNum)) {
      scoreAsNum = 0;
    }
    return { ...c, scoreAsNum: scoreAsNum };
  });

  return ans;
};

if (require.main === module) {
  (async () => {
    const webpage = await prisma.webpage.findFirstOrThrow({
      where: {
        id: "clh9d58tw000198c0g5kfluac",
      },
    });
    const ans = await getCampaignsWithTheirScores(webpage);

    console.log("ans: ", ans);
  })();
}

export default getCampaignsWithTheirScores;
