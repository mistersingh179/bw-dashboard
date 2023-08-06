import logger from "@/lib/logger";
import * as fs from "fs";
import Papa from "papaparse";
import { Prisma } from ".prisma/client";

const myLogger = logger.child({ name: "buildMetaContentFromCsv" });

type BuildMetaContentFromCsv = (csvString: string) => Promise<void>;

const buildMetaContentFromCsv: BuildMetaContentFromCsv = async (csvString) => {
  const parseResult = Papa.parse<{
    url: string;
    input: string;
    output: string;
  }>(csvString, { header: true });
  const result = parseResult.data.map((item) => {
    return {
      ...item,
      output: item.output.split("\n\n"),
    };
  });
  fs.writeFileSync(
    "services/importExport/metaContent.json",
    JSON.stringify(result),
    {}
  );
};

export default buildMetaContentFromCsv;

if (require.main === module) {
  (async () => {
    const content = await fs.readFileSync(
      "services/importExport/ChatGPT creates metacontent for FightBookMMA - 3. output for csv.csv",
      "utf-8"
    );
    await buildMetaContentFromCsv(content);
  })();
}
