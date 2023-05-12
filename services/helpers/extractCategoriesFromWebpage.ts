import { Webpage } from ".prisma/client";
import prisma from "@/lib/prisma";

type ExtractCategoriesFromWebpage = (webpage: Webpage) => Promise<string[]>;

const extractCategoriesFromWebpage: ExtractCategoriesFromWebpage = async (
  webpage
) => {
  // todo - build it
  console.log("inside service: extractCategoriesFromWebpage");
  return ["foo", "bar", "foobar"];
};

export default extractCategoriesFromWebpage;

if (require.main === module) {
  (async () => {
    const webpage = await prisma.webpage.findFirstOrThrow({
      where: {
        id: "clh9d58tw000g98c0zarqhhc6",
      },
    });
    await extractCategoriesFromWebpage(webpage);
  })();
}
