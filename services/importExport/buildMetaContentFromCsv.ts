import * as fs from "fs";
import Papa from "papaparse";

type BuildMetaContentFromCsv = (csvString: string) => Promise<void>;

const buildMetaContentFromCsv: BuildMetaContentFromCsv = async (csvString) => {
  const parseResult = Papa.parse<{
    url: string;
    input: string;
    output: string;
    content_type: string;
  }>(csvString, { header: true });
  const result = parseResult.data.map((item) => {
    item.output = item.output.replace("<<", "<strong>")
    item.output = item.output.replace(">>", "</strong>")
    return {
      // @ts-ignore
      url: item.URL,
      input: item.input,
      output: item.output.split("\n\n"),
      content_type: item.content_type
    };
  });
  fs.writeFileSync(
    "services/importExport/metaContent4.json",
    JSON.stringify(result),
    {}
  );
};

export default buildMetaContentFromCsv;

if (require.main === module) {
  (async () => {
    const content = await fs.readFileSync(
      "services/importExport/Grabbing content - done-URLs-20230814-123649.csv",
      "utf-8"
    );
    await buildMetaContentFromCsv(content);
  })();
}
