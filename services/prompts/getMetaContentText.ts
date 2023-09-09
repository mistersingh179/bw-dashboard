import { CHAT_GPT_FETCH_TIMEOUT } from "@/constants";
import AnyObject from "@/types/AnyObject";
import fetch from "node-fetch";
import prisma from "@/lib/prisma";
import { CreateChatCompletionResponse } from "openai/api";
import logger from "@/lib/logger";
import { differenceInSeconds } from "date-fns";
import {failedPhrases} from "@/services/prompts/getMetaContentHeading";

const myLogger = logger.child({ name: "getMetaContentText" });

const cleanupWordRegex =
  /^(Supplementary Content|Cultural References|Future Trends|Historical Exploration|Scientific Connection|Literature Review|Economic Impact|Cultural Evolution|Geographical Insights|Symbolism and Iconography|Pattern Recognition|Semantic Analysis|Historical Parallels|Moral and Ethical Considerations|Language Evolution|Innovative Applications|Unexplored Dimensions|Cognitive Psychology|Environmental Impact|Cultural Symbolism|Biographical Lens):/im;

type GetMetaContentText = (
  metaContentSpotText: string,
  contentType: string
) => Promise<string>;

const getMetaContentText: GetMetaContentText = async (
  metaContentSpotText,
  contentType
) => {
  myLogger.info("starting service");

  if (process.env.NODE_ENV === "development") {
    return `Meta Content Text for – ${contentType.slice(0, 50)} – ${metaContentSpotText.slice(0, 100)}`
  }

  const messages: AnyObject[] = [
    {
      role: "system",
      content: `You are an editor of the 'For Dummies' book series.`,
    },
    {
      role: "user",
      content: `I will give you original text from a blog post and a content type. \
Create supplementary content that is distinct from the original text \
for the given content type. \
For context, your supplementary content will be placed in a separate \
box alongside the original text. \
Important: restatements or summaries of the original content \
are extremely frowned upon.\n\n\
***\n\
Original text:\n\
${metaContentSpotText}\n\
***\n\
Content type:\n\
${contentType}\n\
***\n\n\
Only output your supplementary content without a heading. \
Never say 'Supplementary Content'. \
Never say 'Tangential tidbit:'. Never say 'Trivia:'. \
Never say 'History:'. Never say 'Contrarian viewpoint:'. \
Limit your entire response to 1000 characters or less. \
Brevity is strongly preferred.\n\
###`,
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
      model: "gpt-3.5-turbo",
      temperature: 0.8,
      messages: messages,
    }),
    signal: controller.signal,
  });
  clearTimeout(timeoutId);
  const reqDuration = differenceInSeconds(performance.now(), reqStartedAt);
  myLogger.info({ reqDuration }, "chatgpt get meta content request finished");
  let data = (await response.json()) as CreateChatCompletionResponse;
  myLogger.info({ data }, "api returned");
  const outputs = data.choices.map((c) => c.message?.content || "");
  let output = outputs[0];

  const failFound = failedPhrases.some((phrase) => output.includes(phrase));
  if (failFound) {
    myLogger.info({ failFound }, "fail phrase found in the output");
    throw new Error("unable to get generate text from api response");
  }

  output = output.replace(cleanupWordRegex, "");
  output = output.trim();
  myLogger.info({ output }, "outputs after cleanup is");

  return output;
};

export default getMetaContentText;

if (require.main === module) {
  (async () => {
    const metaContentSpot = await prisma.metaContentSpot.findFirstOrThrow({
      where: {
        webpageId: "clm9jvmpd00jm980ps1j6c6x1",
      },
    });
    const ans = await getMetaContentText(
      "In partnership with Best Friends Animal Society in Los Angeles, we are pleased to bring you these amazing animals looking for their forever homes. These animals in particular, have been waiting two months or longer to be adopted. Check them out below, then visit the Best Friends Lifesaving Center where you can fall in love with them or one of more than 400 dogs, cats, kittens and puppies from Los Angeles Animal Services shelters. Why the hashtag? Join the no-kill movement and help spread the word by sharing these animals on your socials with the tag #bestfriends.",
      "Explore how cognitive biases or psychological phenomena influence perceptions related to the topic."
    );
    myLogger.info({ ans }, "output");
  })();
}
