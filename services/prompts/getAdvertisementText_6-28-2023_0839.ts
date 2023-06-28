import { CHAT_GPT_FETCH_TIMEOUT } from "@/constants";
import AnyObject from "@/types/AnyObject";
import fetch from "node-fetch";
import prisma from "@/lib/prisma";
import extractCleanedWebpageText from "@/services/helpers/extractCleanedWebpageText";
import { CreateChatCompletionResponse } from "openai/api";
import logger from "@/lib/logger";

import { createReadStream } from 'fs';
import csvParser from 'csv-parser';
import { createObjectCsvWriter } from 'csv-writer';

import { google } from 'googleapis';

type WebPageCampaignPair = {
  campaign_id: string;
  campaign_name: string;
  webpage_id: string;
  webpage_url: string;
};


const myLogger = logger.child({ name: "getAdvertisementText" });

type GetAdvertisementText = (
  html: string,
  title: string | null ,
  description: string | null ,
  beforeText: string,
  afterText: string,
  productName: string,
  productDescription: string,
  desiredAdvertisementCount: number
) => Promise<string[]>;

const getAdvertisementText: GetAdvertisementText = async (
  html,
  title,
  description,
  beforeText,
  afterText,
  productName,
  productDescription,
  desiredAdvertisementCount
) => {
  // myLogger.info("starting service");

  // if (process.env.NODE_ENV === "development") {
  //   return [
  //     `Ad Copy 1 Lorem Lipsum. \n\n Foo Bar. I should not show`,
  //     `Ad Copy 2 for ${productName}, ${productDescription}`,
  //     `Ad Copy 3 for ${productName}, ${productDescription}`,
  //   ].splice(0, desiredAdvertisementCount);
  // }

  const messages: AnyObject[] = [
    {
      role: "system",
      content: `You are an expert article writer.`
    },
    {
      role: "user",
      content: `You must write a single, concise paragraph that places a product \
     in between the existing content of an article. To accomplish your task, I will give you \
      an article's title and description, \
      article content that goes before your new paragraph (BEFORE_CONTENT), \
      article content that goes after your new paragraph (AFTER_CONTENT), \
      a product's name and description, \
      and important rules that you must follow.`
    },
    {
      role: "assistant",
      content: `Ok. Can you provide the article content and product information?`
    },
    {
      role: "user",
      content: `Article Title: ${title} \n\
      ~~~\n\      
      Article Description: ${description} \n\
      ~~~\n\      
      BEFORE_CONTENT:\n${beforeText} \n\
      ~~~\n\
      {your new paragraph will be inserted here}
      ~~~\n\
      AFTER_CONTENT:\n${afterText} \n\
      ~~~\n\
      Product Name: ${productName}\n\
      ~~~\n\
      Product Description: ${productDescription}`
    },
    {
      role: "assistant",
      content: `Ok. What rules should I follow?`
    },
    {
      role: "user",
      content: `Follow the rules in this bullet list:\n\
      • Write a single, concise paragraph.\n\
      • Use a bridge sentence that introduces new information related to the BEFORE_CONTENT without repeating phrases therefrom.\n\
      • Utilize a transition sentence to smoothly connect your paragraph to the AFTER_CONTENT, maintaining coherence without duplicating phrases therefrom. \n\      
      • Use language that is different from the article content to maximize unique content.\n\
      • Provide speculative statements when referencing people, places, or things from the BEFORE_CONTENT or AFTER_CONTENT, using hedge words (like possibly, perhaps, probably, could, would, etc.) to avoid factual assertions.\n\
      • Ensure that the product placement is subtle and integrates naturally into the article.\n\
      • Maintain a clear separation between the author's viewpoint and the product, ensuring there is no implication of endorsement in either direction.\n\
      • Present the product in a positive light, highlighting its beneficial aspects without any negative portrayal.\n\
      • Your answer must output the new paragraph only.\n\
`,
    },
  ];
  // • Your content should make the reader feel positively about the product.\n\
  // • Use language that is distinct and different from BEFORE_CONTENT and AFTER_CONTENT to maintain a unique perspective.\n\
  
  // myLogger.info(messages, "messages being sent to chatGpt");
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
        temperature: 0.2,
        n: desiredAdvertisementCount,
        messages: messages,
      }),
      signal: controller.signal,
    });
  } catch (err) {
    myLogger.error(
      { messages, err },
      "got error while getting advertisement data from chatGpt"
    );
    return [];
  }
  clearTimeout(timeoutId);

  let data = (await response.json()) as CreateChatCompletionResponse;
  // myLogger.info({ data }, "api returned");
  const output = data.choices.map((c) => c.message?.content || "");
  // myLogger.info({ output }, "api output is");
  return output;
};

export default getAdvertisementText;

if (require.main === module) {
  (async () => {

    async function processCSV() {
      const csvData: WebPageCampaignPair[] = [];

      const csvOutput: OutputData[] = [];

      const stream = createReadStream('webpage_campaign_combos.csv')
        .pipe(csvParser({ delimiter: ',', fromLine: 2 }));

      const csvWriter = createObjectCsvWriter({
        path: 'output.csv',
        header: [
          { id: 'campaign_id', title: 'campaign_id' },
          { id: 'campaign_name', title: 'campaign_name' },
          { id: 'webpage_id', title: 'webpage_id' },
          { id: 'webpage_url', title: 'webpage_url' },
          { id: 'webpage_title', title: 'webpage_title' },
          { id: 'filename', title: 'filename' },
          { id: 'model', title: 'model' },
          { id: 'temp', title: 'temp' },
          { id: 'ad', title: 'ad' },
          { id: 'before_ad_after', title: 'before_ad_after' },
          { id: 'pass', title: 'pass' },
          { id: 'notes', title: 'notes' },
        ],
      });
      
      for await (const row of stream) {
        const element: WebPageCampaignPair = {
          campaign_id: row.campaign_id,
          campaign_name: row.campaign_name,
          webpage_id: row.webpage_id,
          webpage_url: row.webpage_url,          
        };
        csvData.push(element);
      }

      for await (const element of csvData) {
        console.log("webpage_id: ", element.webpage_id, "& campaign_id: ", element.campaign_id);
        const webpage = await prisma.webpage.findFirstOrThrow({
          where: {
            id: element.webpage_id,
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
            id: element.campaign_id,
          },
        });
        const ans = await getAdvertisementText(
          extractCleanedWebpageText(
            webpage.content!.desktopHtml || "",
            200,
            "body"
          ),
          webpage.content!.title,
          webpage.content!.description,
          webpage.advertisementSpots[0].beforeText,
          webpage.advertisementSpots[0].afterText,
          campaign.productName,
          campaign.productDescription,
          1
        );
        // console.log("\n~~~~~~~~~~~~~~~~~~\n");
        // console.log("title: ", webpage.content!.title);
        // console.log("BEFORE: ", webpage.advertisementSpots[0].beforeText);
        // console.log(ans);
        // console.log("AFTER: ", webpage.advertisementSpots[0].afterText);
        // console.log("\n~~~~~~~~~~~~~~~~~~\n");

        const outputElement: OutputData = {
          campaign_id: element.campaign_id,
          campaign_name: element.campaign_name,
          webpage_id: element.webpage_id,
          webpage_url: element.webpage_url,
          webpage_title: webpage.content!.title,
          filename: "getAdvertisementText_6-28-2023_0839.ts",
          model: "gpt-3.5-turbo-0301",
          temp: "0",
          ad: ans[0],
          before_ad_after: `${webpage.advertisementSpots[0].beforeText}\n>>>>> \n${ans[0]}\n>>>>>\n${webpage.advertisementSpots[0].afterText}`, 
          pass:  "",
          notes: "",
        };
        csvOutput.push(outputElement);
        console.log(outputElement);
      };

      csvWriter.writeRecords(csvOutput)       // returns a promise
      .then(() => {
        console.log('...Done exporting to CSV...');
      });

      const headers = Object.keys(csvOutput[0]);
      const csvDataAsRows = [ // Convert csvOutput to an array of rows
        headers, 
        ...csvOutput.map((record) => Object.values(record))
      ];

      const auth = new google.auth.GoogleAuth({
        keyFile: 'zippy-haiku-387802-04455ac6f976.json', // Replace with your credentials file
        scopes: ['https://www.googleapis.com/auth/spreadsheets'],
      });
      
      const client = await auth.getClient();
      
      const sheets = google.sheets({ version: 'v4', auth: client });
      
      const spreadsheetId = '1BiWN1KzW2EHCQPWGKsvsM4rvULfsuLUGvdg5l6CkWPo'; // Replace with your spreadsheet ID

      const sheetName = `${Date.now()}`; // Replace with your spreadsheet ID
 
      const createSheetRequest = {
        addSheet: {
          properties: {
            title: sheetName,
          },
        },
      };
      
      const batchUpdateRequest = {
        spreadsheetId,
        requestBody: {
          requests: [createSheetRequest],
        },
      };
      
      const createSheetResponse = await sheets.spreadsheets.batchUpdate(batchUpdateRequest);
      const sheetId = createSheetResponse.data.replies[0].addSheet.properties.sheetId;
      
      const resource = {
        values: csvDataAsRows,
      };      

      const range = `${sheetName}!A1`; // Update with the desired sheet name

      const updateValuesRequest = {
        spreadsheetId,
        range,
        valueInputOption: 'RAW',
        requestBody: resource,
      };
      
      const updateValuesResponse = await sheets.spreadsheets.values.update(updateValuesRequest);
    
      console.log(`sheet cells updated.`);

    }
    processCSV().catch((error) => {
      console.error(error);
    });

  })();
}
