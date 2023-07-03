import logger from "@/lib/logger";
import * as fs from "fs";
import Papa from "papaparse";
import prisma from "@/lib/prisma";
import { Prisma, Website } from ".prisma/client";
import WebpageCreateManyInput = Prisma.WebpageCreateManyInput;
import getWebpagesWithZeroAds from "@/services/queries/getWebpagesWithZeroAds";
import processWebpageQueue from "@/jobs/queues/processWebpageQueue";

const myLogger = logger.child({ name: "buildWebpagesFromCsv" });

type BuildWebpagesFromCsv = (
  csvString: string,
  urlColumnName: string,
  website: Website,
  maxCount?: number
) => Promise<void>;

const buildWebpagesFromCsv: BuildWebpagesFromCsv = async (
  csvString,
  urlColumnName,
  website,
  maxCount
) => {
  myLogger.info({ length: csvString.length }, "inside service");
  const parseResult = Papa.parse(csvString, { header: true });
  const urls = parseResult.data
    .slice(0, maxCount)
    .map((x: any) => x[urlColumnName] as string);
  console.log({ length: urls.length }, "going to insert");
  const today = new Date();
  const webpageInput: WebpageCreateManyInput[] = urls.map((url) => ({
    websiteId: website.id,
    url,
    status: true,
    lastModifiedAt: today,
  }));
  const { count: dbInsertedCount } = await prisma.webpage.createMany({
    data: webpageInput,
    skipDuplicates: true,
  });
  myLogger.info({ dbInsertedCount }, "webpages inserted");

  const webpages = await getWebpagesWithZeroAds(website.id);
  myLogger.info(
    {
      length: webpages.length,
      website,
    },
    "number of webpages with zero ads"
  );
  for (const webpage of webpages) {
    const job = await processWebpageQueue.add("processWebpage", {
      webpage: webpage,
    });
    myLogger.info({ id: job.id, webpage }, "scheduled job to process Webpage");
  }
};

export default buildWebpagesFromCsv;

if (require.main === module) {
  (async () => {
    const website = await prisma.website.findFirstOrThrow({
      where: {
        id: "clis07uvt01bdmq08xrjs15kf",
      },
    });
    const content = await fs.readFileSync(
      "services/importExport/Articles List - StyleCraze [BrandWeaver  + MomJunction] - Trending articles.csv",
      "utf-8"
    );
    await buildWebpagesFromCsv(content, "Article_url", website, 100);
  })();
}
