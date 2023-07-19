import { Content, Prisma, User, Webpage } from ".prisma/client";
import prisma from "@/lib/prisma";
import extractCategoriesFromWebpage from "@/services/helpers/extractCategoriesFromWebpage";
import CategoryCreateOrConnectWithoutWebpagesInput = Prisma.CategoryCreateOrConnectWithoutWebpagesInput;
import logger from "@/lib/logger";

const myLogger = logger.child({ name: "createCategories" });

type CreateCategories = (
  webpage: Webpage,
  content: Content,
  user: User,
  abortIfExists?: boolean
) => Promise<void>;

const createCategories: CreateCategories = async (
  webpage,
  content,
  user,
  abortIfExists = true
) => {
  myLogger.info({ webpage, user }, "starting service");
  if (abortIfExists) {
    const existingCategoryCount = await prisma.category.count({
      where: {
        webpages: {
          some: {
            id: webpage.id,
          },
        },
      },
    });

    // todo - consider rebuilding categories when webpage content has changed.
    if (existingCategoryCount > 0) {
      myLogger.info(
        { url: webpage.url, existingCategoryCount },
        "aborting as already have categories"
      );
      return;
    }
  }

  const categoriesOfThisWebpage = await extractCategoriesFromWebpage(
    webpage,
    content
  );

  const categoryConnectOrCreateInput = categoriesOfThisWebpage.map(
    (x): CategoryCreateOrConnectWithoutWebpagesInput => ({
      where: {
        userId_name: {
          userId: user.id,
          name: x,
        },
      },
      create: {
        userId: user.id,
        name: x,
      },
    })
  );

  await prisma.webpage.update({
    where: {
      id: webpage.id,
    },
    data: {
      categories: {
        connectOrCreate: categoryConnectOrCreateInput,
      },
    },
  });
};

export default createCategories;

if (require.main === module) {
  (async () => {
    const webpage = await prisma.webpage.findFirstOrThrow({
      where: {
        id: "cljr7yvea004w98cigf2apjot",
      },
      include: {
        website: {
          include: {
            user: true,
          },
        },
        categories: true,
      },
    });
    const content = await prisma.content.findFirstOrThrow({
      where: {
        webpageId: webpage.id,
      },
    });

    console.log(
      "webpage: ",
      webpage.id,
      webpage.website.id,
      webpage.website.user.id,
      webpage.categories
    );
    await createCategories(webpage, content, webpage.website.user, true);
  })();
}
