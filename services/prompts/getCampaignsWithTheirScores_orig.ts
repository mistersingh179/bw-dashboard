import { Campaign, Setting, Webpage } from "@prisma/client";
import prisma from "@/lib/prisma";
import Papa from "papaparse";
import AnyObject from "@/types/AnyObject";
import fetch from "node-fetch";
import extractCleanedWebpageText from "@/services/helpers/extractCleanedWebpageText";
import { CreateChatCompletionResponse } from "openai/api";
import { CHAT_GPT_FETCH_TIMEOUT } from "@/constants";
import { Content } from ".prisma/client";
import logger from "@/lib/logger";
import { differenceInSeconds } from "date-fns";

export type CampaignProductWithScore = {
  id: string;
  name: string;
  description?: string;
  score?: string;
  scoreAsNum?: number;
  reason?: string;
};

const myLogger = logger.child({ name: "getCampaignsWithTheirScores" });

type GetCampaignsWithTheirScores = (
  webpage: Webpage,
  campaigns: Campaign[],
  content: Content,
  setting: Setting
) => Promise<CampaignProductWithScore[]>;

const getCampaignsWithTheirScores: GetCampaignsWithTheirScores = async (
  webpage,
  campaigns,
  content,
  settings
) => {
  myLogger.info({ webpage, campaigns }, "starting service");

  const webpageText = extractCleanedWebpageText(
    content.desktopHtml,
    200,
    settings.mainPostBodySelector
  );

  const campaignsWithScore: CampaignProductWithScore[] = campaigns.map((c) => ({
    id: c.id,
    name: c.productName,
    description: c.productDescription,
    score: "?",
    reason: "?",
  }));

  if (process.env.NODE_ENV === "development") {
    return campaignsWithScore.map(
      (c: CampaignProductWithScore): CampaignProductWithScore => {
        const randomScore = Math.round(Math.random() * 4);
        return {
          ...c,
          scoreAsNum: randomScore,
          score: "0",
          reason: "reason is this",
        };
      }
    );
  }

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
        `to you. In the csv only include the product's id, name, score and reason column. ` +
        `Put the reason in quotes so it does not break csv format.`,
    },
  ];
  myLogger.info({ webpage, messages }, "sending messages to chatGpt");

  const controller = new AbortController();
  const timeoutId = setTimeout(() => {
    myLogger.error(
      { webpage, messages },
      "chatgpt fetch campaigns with scores request has timed out"
    );
    controller.abort();
  }, CHAT_GPT_FETCH_TIMEOUT);
  const reqStartedAt = performance.now();
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
      messages: messages,
    }),
    signal: controller.signal,
  });
  clearTimeout(timeoutId);
  const reqDuration = differenceInSeconds(performance.now(), reqStartedAt);
  myLogger.info(
    { webpage, messages, reqDuration },
    "chatgpt get campaigns score fetch request finished"
  );

  let data = (await response.json()) as CreateChatCompletionResponse;
  myLogger.info({ webpage, data }, "api returned");

  const output = data.choices[0]?.message?.content || "";
  myLogger.info({ webpage, output }, "api output is ");

  const outputObj = Papa.parse<CampaignProductWithScore>(output, {
    header: true,
  });
  myLogger.info({ webpage, data: outputObj.data }, "campaigns with scores");

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
        id: "cljzvem3l000jpj216dhg4ua0",
      },
    });
    const campaigns = await prisma.campaign.findMany({
      where: {
        userId: "cljvgedipcbyqph1qssejc7z5",
      },
    });
    const settings = await prisma.setting.findFirstOrThrow({
      where: {
        userId: "cljvgedipcbyqph1qssejc7z5",
      },
    });
    const content = await prisma.content.findFirst({
      where: {
        webpageId: webpage.id,
      },
    });

    const ans = await getCampaignsWithTheirScores(
      webpage,
      campaigns,
      content!,
      settings
    );

    console.log("***ans: ", ans);
  })();
}

export default getCampaignsWithTheirScores;
