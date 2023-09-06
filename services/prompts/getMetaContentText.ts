import { CHAT_GPT_FETCH_TIMEOUT } from "@/constants";
import AnyObject from "@/types/AnyObject";
import fetch from "node-fetch";
import prisma from "@/lib/prisma";
import extractCleanedWebpageText from "@/services/helpers/extractCleanedWebpageText";
import { CreateChatCompletionResponse } from "openai/api";
import logger from "@/lib/logger";
import { differenceInSeconds } from "date-fns";

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
    return `Meta Content Text for ${contentType.slice(0, 10)} – ${metaContentSpotText.slice(0, 100)}`
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
      model: "gpt-3.5-turbo-0301",
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
  output = output.replace(cleanupWordRegex, '');
  output = output.trim();
  myLogger.info({ output }, "outputs after cleanup is");

  return output;
};

export default getMetaContentText;

if (require.main === module) {
  (async () => {
    const metaContentSpot = await prisma.metaContentSpot.findFirstOrThrow({
      where: {
        webpageId: "clkrey0jx000m985gb765ieg0",
      },
    });
    const ans = await getMetaContentText(
      metaContentSpot.contentText,
      "hollwood movie"
    );
    myLogger.info({ ans }, "output");
  })();
}
