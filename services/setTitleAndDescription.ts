import { Content, Prisma, User, Webpage } from ".prisma/client";
import prisma from "@/lib/prisma";
import extractCategoriesFromWebpage from "@/services/helpers/extractCategoriesFromWebpage";
import CategoryCreateOrConnectWithoutWebpagesInput = Prisma.CategoryCreateOrConnectWithoutWebpagesInput;
import logger from "@/lib/logger";
import extractTitleAndDescriptionFromWebpage from "@/services/helpers/extractTitleAndDescriptionFromWebpage";

const myLogger = logger.child({ name: "setTitleAndDescription" });

type setTitleAndDescription = (
  webpage: Webpage,
  content: Content,
  user: User
) => Promise<void>;

const setTitleAndDescription: setTitleAndDescription = async (
  webpage,
  content,
  user
) => {
  myLogger.info({ url: webpage.url, email: user.email }, "started service");

  content = await prisma.content.findFirstOrThrow({
    where: {
      id: content.id,
    },
  });

  // todo - consider rebuilding title & description when webpage content has changed.
  if (content.title !== null || content.description !== null) {
    const { id, title, description } = content;
    const { url } = webpage;
    myLogger.info(
      { url, title, description, id },
      "aborting as we already have title and description"
    );
    return;
  }

  const { title, description } = await extractTitleAndDescriptionFromWebpage(
    webpage,
    content
  );

  await prisma.content.update({
    where: {
      id: content.id,
    },
    data: {
      title,
      description,
    },
  });
};

export default setTitleAndDescription;

if (require.main === module) {
  (async () => {
    const webpage = await prisma.webpage.findFirstOrThrow({
      where: {
        // id: "clh9d58tw000098c05nhdmbql",
        id: "clj7p8hyf000098xf2r5saq46",
      },
      include: {
        website: {
          include: {
            user: true,
          },
        },
        categories: true,
        content: true,
      },
    });
    console.log(
      "webpage: ",
      webpage.id,
      webpage.website.id,
      webpage.website.user.id,
      webpage.categories
    );
    await setTitleAndDescription(
      webpage,
      webpage.content!,
      webpage.website.user
    );
  })();
}
