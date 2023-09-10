import {
  MetaContent,
  MetaContentSpot,
  MetaContentType,
  Prisma,
} from "@prisma/client";
import prisma from "@/lib/prisma";
import logger from "@/lib/logger";
import { sample } from "lodash";
import getMetaContentText from "@/services/prompts/getMetaContentText";
import getMetaContentHeading from "@/services/prompts/getMetaContentHeading";
import getMetaContentDiversityClassification, {
  ClassificationResultType,
} from "@/services/prompts/getMetaContentDiversityClassification";
import MetaContentUncheckedCreateInput = Prisma.MetaContentUncheckedCreateInput;
import { DIVERSITY_CLASSIFIER } from "@/constants";

const activeDiverseMetaContentsExist = async (
  metaContentSpot: MetaContentSpot
): Promise<boolean> => {
  const result = await prisma.metaContent.findMany({
    where: {
      metaContentSpotId: metaContentSpot.id,
      status: true,
      diveristyClassifierResult: DIVERSITY_CLASSIFIER.DIVERSE,
    },
    select: {
      id: true,
    },
    take: 1,
  });
  return result.length === 1;
};

const manySimilarMetaContentsExist = async (
  metaContentSpot: MetaContentSpot
): Promise<boolean> => {
  const result = await prisma.metaContent.findMany({
    where: {
      metaContentSpotId: metaContentSpot.id,
      status: true,
      diveristyClassifierResult: DIVERSITY_CLASSIFIER.SIMILAR,
    },
    select: {
      id: true,
    },
    take: 3,
  });
  return result.length === 3;
};

type CreateMetaContents = (
  metaContentSpot: MetaContentSpot
) => Promise<MetaContent[] | null>;

const createMetaContents: CreateMetaContents = async (metaContentSpot) => {
  const myLogger = logger.child({
    name: "createMetaContents",
    metaContentSpot,
  });

  myLogger.info({}, "starting service");

  if (await activeDiverseMetaContentsExist(metaContentSpot)) {
    myLogger.info({}, "Aborting as we have an active & diverse meta content");
    return null;
  }

  if (await manySimilarMetaContentsExist(metaContentSpot)) {
    myLogger.info({}, "Aborting as we many similar meta contents");
    return null;
  }

  const content = await prisma.content.findFirstOrThrow({
    where: {
      webpageId: metaContentSpot.webpageId,
    },
  });
  const title = content.title || ""

  const { contentText: metaContentSpotText } = metaContentSpot;

  const existingMetaContent = await prisma.metaContent.findMany({
    where: {
      metaContentSpotId: metaContentSpot.id,
    },
    include: {
      metaContentType: true,
    },
    distinct: "metaContentTypeId",
  });
  const existingMetaContentTypes = existingMetaContent.map(
    (mc) => mc.metaContentType
  );
  const existingMetaContentTypeNames = existingMetaContentTypes.map(
    (mct) => mct.name
  );
  const remainingContentTypes = await prisma.metaContentType.findMany({
    where: {
      name: {
        notIn: existingMetaContentTypeNames,
      },
    },
  });
  if (remainingContentTypes.length === 0) {
    myLogger.info({}, "Aborting as there are no more remaining content types");
    return null;
  }

  const pickedContentType = sample(remainingContentTypes) as MetaContentType;

  let metaContentText: string,
    metaContentHeading: string,
    metaContentDiversityClassification: ClassificationResultType;

  try {
    metaContentText = await getMetaContentText(
      metaContentSpotText,
      pickedContentType.name,
      title,
    );
    metaContentHeading = await getMetaContentHeading(metaContentText);
    metaContentDiversityClassification =
      await getMetaContentDiversityClassification(
        metaContentSpotText,
        metaContentText
      );
  } catch (err) {
    myLogger.error({ err }, "aborting as got error while getting meta content");
    await prisma.metaContentSpot.update({
      where: {
        id: metaContentSpot.id,
      },
      data: {
        buildFailCount: {
          increment: 1,
        },
      },
    });
    return null;
  }

  const metaContentData: MetaContentUncheckedCreateInput = {
    metaContentSpotId: metaContentSpot.id,
    metaContentTypeId: pickedContentType.id,
    generatedText: metaContentText,
    generatedHeading: metaContentHeading,
    diveristyClassifierResult: metaContentDiversityClassification.answer,
    diveristyClassifierReason: metaContentDiversityClassification.reasoning,
    status: true,
  };

  myLogger.info({ metaContentData }, "got data to build meta content");

  await prisma.metaContent.create({
    data: metaContentData,
  });

  if (metaContentDiversityClassification.answer === "SIMILAR") {
    await createMetaContents(metaContentSpot);
  }

  const allMetaContents = await prisma.metaContent.findMany({
    where: {
      metaContentSpotId: metaContentSpot.id,
    },
  });

  return allMetaContents;
};

export default createMetaContents;

if (require.main === module) {
  (async () => {
    const webpage = await prisma.webpage.findFirstOrThrow({
      where: {
        id: "clm9jvmpd00jm980ps1j6c6x1",
      },
      include: {
        metaContentSpots: true,
        website: {
          include: {
            user: {
              include: {
                setting: true,
              },
            },
          },
        },
      },
    });
    console.log("webpage: ", webpage.url, webpage.metaContentSpots.length);
    for (const mcs of webpage.metaContentSpots) {
      await createMetaContents(mcs);
      break;
    }
  })();
}
