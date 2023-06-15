import { Setting, Webpage } from "@prisma/client";
import fetchContentOfWebpage from "@/services/helpers/fetchContentOfWebpage";
import prisma from "@/lib/prisma";
import { Content, User } from ".prisma/client";
import logger from "@/lib/logger";

const myLogger = logger.child({ name: "createContent" });

type CreateContent = (
  webpage: Webpage,
  settings: Setting,
  user: User
) => Promise<Content | null>;
const createContent: CreateContent = async (webpage, settings, user) => {
  myLogger.info({url: webpage.url, email: user.email}, "started service");

  const existingContent = await prisma.content.findFirst({
    where: {
      webpageId: webpage.id,
    },
  });

  // todo - allow updating webpage content when data is outdated or some other rule
  if (existingContent !== null) {
    myLogger.info({}, "aborting as content already exists");
    return existingContent;
  }

  let htmlContent = "";
  try {
    htmlContent = await fetchContentOfWebpage(webpage.url, "text/html");
  } catch (err) {
    myLogger.error({err}, "aborting as got error while fetching webpage content")
    return null;
  }

  const content = await prisma.content.create({
    data: {
      webpageId: webpage.id,
      desktopHtml: htmlContent,
    },
  });

  return content;
};

export default createContent;

if (require.main === module) {
  (async () => {
    const webpage = await prisma.webpage.findFirstOrThrow({
      where: {
        id: "cli38233j000098m9ug7e78m7",
      },
      include: {
        website: {
          include: {
            user: {
              include: {
                setting: true,
              },
            },
          },
        },
        content: true,
        _count: {
          select: {
            categories: true,
            advertisementSpots: true,
            scoredCampaigns: true,
          },
        },
      },
    });
    const updatedWebpage = await createContent(
      webpage,
      webpage.website.user.setting!,
      webpage.website.user
    );
    console.log(updatedWebpage);
  })();
}
