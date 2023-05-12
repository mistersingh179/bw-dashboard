import {
  Prisma,
  Webpage,
} from ".prisma/client";
import prisma from "@/lib/prisma";
import extractCategoriesFromWebpage from "@/services/helpers/extractCategoriesFromWebpage";
import CategoryCreateOrConnectWithoutWebpagesInput = Prisma.CategoryCreateOrConnectWithoutWebpagesInput;

type CreateCategories = (webpage: Webpage) => Promise<void>;

const createCategories: CreateCategories = async (webpage) => {
  console.log("inside service: createCategories");

  if (webpage.html === "") {
    console.log("aborting createCategories as the webpage does not have html");
    return;
  }

  const myCategoryCount = await prisma.category.count({
    where: {
      webpages: {
        some: {
          id: webpage.id,
        },
      },
    },
  });
  console.log("my existing myCategoryCount: ", myCategoryCount);
  if (myCategoryCount > 0) {
    console.log("aborting createCategories as i already have them");
    return;
  }

  const webpageWithUser = await prisma.webpage.findFirstOrThrow({
    where: {
      id: webpage.id,
    },
    include: {
      website: {
        include: {
          user: true,
        },
      },
    },
  });
  const user = webpageWithUser.website.user;
  const categoriesOfThisWebpage = await extractCategoriesFromWebpage(webpage);

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
        id: "clh9d58tw000098c05nhdmbql",
        // id: "clh9d58tw000198c0g5kfluac",
      },
    });
    await createCategories(webpage);
  })();
}
