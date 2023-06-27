import fetch from "node-fetch";
import { config } from "dotenv";
import logger from "@/lib/logger";
config();

const url = process.env.SLACK_BW_WEBHOOK ?? "";

const myLogger = logger.child({ name: "postOnSlack" });

type PostOnSlack = (heading: string, messageObj: object) => Promise<void>;
const postOnSlack: PostOnSlack = async (heading, messageObj) => {
  const foo = JSON.stringify({
    text: "Heading",
    "blocks": [
      {
        "type": "section",
        "text": {
          "type": "mrkdwn",
          "text": `*${heading}*`
        }
      },
      {
        "type": "section",
        "text": {
          "type": "mrkdwn",
          "text": JSON.stringify(messageObj, null, 2),
        }
      },]
  });
  try {
    const res = await fetch(process.env.SLACK_BW_WEBHOOK!, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: foo,
    });
    myLogger.info(
      `response after posting to slack: ${res.status} – ${res.statusText}`
    );
    const text = await res.text();
    myLogger.info(`text after posting to slack: ${text}`);
  } catch (err) {
    myLogger.error({ err }, "unable to post to slack");
  }
};

export default postOnSlack;

if (require.main === module) {
  (async () => {
    console.log("before");
    await postOnSlack("Test Message", { greeting: "foo bar" });
    console.log("after");
  })();
}
