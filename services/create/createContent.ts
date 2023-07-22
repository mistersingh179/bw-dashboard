import { Setting, Webpage } from "@prisma/client";
import fetchContentOfWebpage from "@/services/helpers/fetchContentOfWebpage";
import prisma from "@/lib/prisma";
import { Content, User } from ".prisma/client";
import logger from "@/lib/logger";
import { pickBy } from "lodash";

const GATED_CONTENT_PHRASE = [
  "Sorry! An active online subscription is required to access this content.",
];

type CreateContent = (
  webpage: Webpage,
  settings: Setting,
  user: User,
  abortIfExists?: boolean
) => Promise<Content | null>;

const removeNested = (obj: object) =>
  pickBy(obj, (x) => x == null || typeof x != "object");

const createContent: CreateContent = async (
  webpage,
  settings,
  user,
  abortIfExists = true
) => {
  const myLogger = logger.child({
    name: "createContent",
    webpage: removeNested(webpage),
    user: removeNested(user),
    abortIfExists,
  });

  myLogger.info({}, "starting service");

  if (abortIfExists) {
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
  }

  let htmlContent = "";
  try {
    htmlContent = await fetchContentOfWebpage(webpage.url, "text/html");
  } catch (err) {
    myLogger.info({ err }, "aborting as got error while fetching content");
    return null;
  }

  myLogger.info(
    { htmlContent: htmlContent.substring(0, 10000) },
    "got content"
  );

  if (GATED_CONTENT_PHRASE.some((phrase) => htmlContent.includes(phrase))) {
    myLogger.info({}, "aborting as we got gated content page");
    return null;
  }

  const content = await prisma.content.upsert({
    where: {
      webpageId: webpage.id,
    },
    create: {
      webpageId: webpage.id,
      desktopHtml: htmlContent,
    },
    update: {
      desktopHtml: htmlContent,
    },
  });

  myLogger.info({}, "finsihed service");

  return content;
};

export default createContent;

if (require.main === module) {
  (async () => {
    const webpage = await prisma.webpage.findFirstOrThrow({
      where: {
        id: "clkcsx5290007r921kaamxqy1",
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
      webpage.website.user,
      false
    );
    console.log(updatedWebpage);
  })();
}
