import {CHAT_GPT_FETCH_TIMEOUT, DIVERSITY_CLASSIFIER} from "@/constants";
import AnyObject from "@/types/AnyObject";
import fetch from "node-fetch";
import prisma from "@/lib/prisma";
import extractCleanedWebpageText from "@/services/helpers/extractCleanedWebpageText";
import { CreateChatCompletionResponse } from "openai/api";
import logger from "@/lib/logger";
import { differenceInSeconds } from "date-fns";

const myLogger = logger.child({
  name: "getMeatContentDiversityClassification",
});

const expectedJsonStr = `{"type": "answer", "content": "`;

export type ClassificationResultType = {
  answer: string;
  reasoning: string;
};

type GetMetaContentDiversityClassification = (
  metaContentSpotText: string,
  metaContentText: string
) => Promise<ClassificationResultType>;

const getMeatContentDiversityClassification: GetMetaContentDiversityClassification =
  async (metaContentSpotText, metaContentText) => {
    myLogger.info("starting service");

    if (process.env.NODE_ENV === "development") {
      return {
        answer: DIVERSITY_CLASSIFIER.DIVERSE,
        reasoning: "because i said so"
      }
    }

    const messages: AnyObject[] = [
      {
        role: "system",
        content: `You are a fussy editor who hates repetitive content.`,
      },
      {
        role: "user",
        content: `Your task is to assess the diversity between two given texts. \
Your criterion for diversity is stringent: even a 25% overlap in ideas, facts, \
concepts, topics, or subjects is considered excessive similarity. \n\n\
Text 1:\n\
${metaContentSpotText} \n\n\
Text 2:\n\
${metaContentText} \n\n\
Write out in a step by step manner your reasoning about the diverse criterion \
to be sure that your conclusion is correct. Avoid simply stating the correct answers \
at the outset. Then print only 'SIMILAR' or 'DIVERSE' (without quotes or punctuation) \
in JSON, like this: {"type": "answer", "content": ____}`,
      },
    ];
    myLogger.info(messages, "messages being sent to chatGpt");
    const controller = new AbortController();
    const timeoutId = setTimeout(() => {
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
        temperature: 0.8,
        n: 1,
        messages: messages,
      }),
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
    const reqDuration = differenceInSeconds(performance.now(), reqStartedAt);
    myLogger.info(
      { reqDuration },
      "chatgpt get diversity similarity classification request finished"
    );
    let data = (await response.json()) as CreateChatCompletionResponse;
    myLogger.info({ data }, "api returned");
    const outputs = data.choices.map((c) => c.message?.content || "");
    let output = outputs[0];

    let reasoning, answer;

    if (output.indexOf(expectedJsonStr) >= 0) {
      reasoning = output.split(expectedJsonStr)[0].trim();
      answer = output.split(expectedJsonStr)[1].replace(`"}`, "");
      return { answer, reasoning };
    } else if (
      output.indexOf("SIMILAR") >= 0 &&
      output.indexOf("DIVERSE") == -1
    ) {
      reasoning = output.trim();
      answer = DIVERSITY_CLASSIFIER.SIMILAR
    } else if (
      output.indexOf("SIMILAR") == -1 &&
      output.indexOf("DIVERSE") >= 0
    ) {
      reasoning = output.trim();
      answer = DIVERSITY_CLASSIFIER.DIVERSE;
    } else {
      throw new Error("unable to parse diversity classification api response");
    }

    const result = { reasoning, answer };
    myLogger.info(result, "outputs after cleanup is");
    return result;
  };

export default getMeatContentDiversityClassification;

if (require.main === module) {
  (async () => {
    const metaContentSpot = await prisma.metaContentSpot.findFirstOrThrow({
      where: {
        webpageId: "clkrey0jx000m985gb765ieg0",
      },
    });
    const ans = await getMeatContentDiversityClassification(
      "\\nThe following method I patched together from recipes in both Joy of Cooking and Cook's Illustrated's The Best Recipe. The pizza dough recipe makes enough dough for two 10 to 12 inch pizzas.\\n",
      "\"In the classic novel, Little Women, the characters Meg, Jo, Beth, and Amy make homemade dough for their family's pizza night. While the recipe they used may have been simple, making dough from scratch can be a daunting task. But fear not, with this recipe, you'll be able to whip up enough dough for two delicious pizzas just like the March sisters."
    );
    myLogger.info({ ans }, "output");
  })();
}
