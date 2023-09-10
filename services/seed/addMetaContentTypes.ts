import logger from "@/lib/logger";
import prisma from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import MetaContentTypeCreateManyInput = Prisma.MetaContentTypeCreateManyInput;

const myLogger = logger.child({ name: "addMetaContentTypes" });

type AddMetaContentTypes = () => Promise<void>;

const contentTypes = [
  "Teach the reader something new or surprising about the topic.",
  "Offer an interesting cultural fact that is related to the topic.",
  "Offer an interesting technological fact that is related to the topic.",
  "Offer an interesting musical anecdote that is related to the topic.",
  "Offer an interesting economic fact that is related to the topic.",
  "Offer an interesting linguistic tidbit that is related to the topic.",
  "Offer an interesting psychological anecdote that is related to the topic.",
  "Offer an interesting artistic anecdote that is related to the topic.",
  "Offer an interesting social tidbit that is related to the topic.",
  "Offer an interesting historical tidbit that is related to the topic.",
  "Offer an interesting scientific fact that is related to the topic.",
  "Enrich the reader's understanding of the topic from a historical lens.",
  "Connect the topic to a scientific principle, study, or discovery that might not be commonly associated with it, offering a scientific lens for readers to explore.",
  "Trace the historical evolution of the topic, highlighting how perceptions or practices have shifted over time.",
];

const addMetaContentTypes: AddMetaContentTypes = async () => {
  myLogger.info({}, "inside service");

  const inputData: MetaContentTypeCreateManyInput[] = contentTypes.map(
    (name) => {
      return {
        name: name,
      };
    }
  );

  const result = await prisma.metaContentType.createMany({
    data: inputData,
    skipDuplicates: true,
  });
  myLogger.info({ result }, "inside service");
};

export default addMetaContentTypes;

if (require.main === module) {
  (async () => {
    await addMetaContentTypes();
  })();
}
