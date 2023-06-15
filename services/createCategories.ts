import { Content, Prisma, User, Webpage } from ".prisma/client";
import prisma from "@/lib/prisma";
import extractCategoriesFromWebpage from "@/services/helpers/extractCategoriesFromWebpage";
import CategoryCreateOrConnectWithoutWebpagesInput = Prisma.CategoryCreateOrConnectWithoutWebpagesInput;
import logger from "@/lib/logger";

const myLogger = logger.child({ name: "createCategories" });

type CreateCategories = (
  webpage: Webpage,
  content: Content,
  user: User
) => Promise<void>;

const createCategories: CreateCategories = async (webpage, content, user) => {
  myLogger.info({ url: webpage.url, email: user.email }, "started service");

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
      { existingCategoryCount },
      "aborting as already have categories"
    );
    return;
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
        // id: "clh9d58tw000098c05nhdmbql",
        id: "cli38233j000098m9ug7e78m7",
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
    await createCategories(webpage, webpage.content!, webpage.website.user);
  })();
}
