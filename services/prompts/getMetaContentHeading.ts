import { CHAT_GPT_FETCH_TIMEOUT } from "@/constants";
import AnyObject from "@/types/AnyObject";
import fetch from "node-fetch";
import prisma from "@/lib/prisma";
import extractCleanedWebpageText from "@/services/helpers/extractCleanedWebpageText";
import { CreateChatCompletionResponse } from "openai/api";
import logger from "@/lib/logger";
import { differenceInSeconds } from "date-fns";
import ansiStyles from "ansi-styles";

const myLogger = logger.child({ name: "getMetaContentHeading" });

type GetMetaContentHeading = (metaContentText: string) => Promise<string>;

const getMetaContentHeading: GetMetaContentHeading = async (
  metaContentText
) => {
  myLogger.info("starting service");

  if (process.env.NODE_ENV === "development") {
    return `Meta Content Heading for ${metaContentText}`;
  }

  const messages: AnyObject[] = [
    {
      role: "system",
      content: `You are an editor of the 'For Dummies' book series.`,
    },
    {
      role: "user",
      content: `I will give you content. You will draft one succinct, eye-catching headline.\n\n\
Content: ${metaContentText}"\n\n\
Do not label your output as 'Headline:'; simply output the text wrapped in << >>. \
Brevity is strongly preferred, so limit your answer to 40 characters. \n\n\\
###\n\n`,
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
      messages: messages,
    }),
    signal: controller.signal,
  });
  clearTimeout(timeoutId);
  const reqDuration = differenceInSeconds(performance.now(), reqStartedAt);
  myLogger.info({ reqDuration }, "chatgpt meta content heading req finished");
  let data = (await response.json()) as CreateChatCompletionResponse;
  myLogger.info({ data }, "api returned");
  const outputs = data.choices.map((c) => c.message?.content || "");
  let output = outputs[0];
  let heading = '';
  if(output.indexOf(">>") >= 0 && output.indexOf("<<") >= 0){
    const regexAns = output.match(/<<(.*)>>/);
    if(regexAns && regexAns[1]){
      heading = regexAns[1];
    }
  }else{
    heading = output;
  }
  heading = heading.trim();
  myLogger.info({ heading }, "outputs after cleanup is");

  return heading;
};

export default getMetaContentHeading;

if (require.main === module) {
  (async () => {
    const metaContentSpot = await prisma.metaContentSpot.findFirstOrThrow({
      where: {
        webpageId: "clkrey0jx000m985gb765ieg0",
      },
    });
    const ans = await getMetaContentHeading(
      metaContentSpot.contentText,
    );
    myLogger.info({ ans }, "output");
  })();
}
