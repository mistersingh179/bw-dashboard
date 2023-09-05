import logger from "@/lib/logger";
import prisma from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import MetaContentTypeCreateManyInput = Prisma.MetaContentTypeCreateManyInput;

const myLogger = logger.child({ name: "addMetaContentTypes" });

type AddMetaContentTypes = () => Promise<void>;

const contentTypes = [
  "Draw parallels between the topic and pop culture, literature, movies, or art to make the content more relatable and interesting.",
  "Offer an interesting and obscure facts that is not directly related to the main content – often a unique piece of information or an unexpected fact that is distinct from the original text.",
  "Discuss emerging trends or predictions related to the topic, providing readers with a glimpse into what the future might hold.",
  "Enrich the reader's understanding of the topic from a historical lens.",
  "Connect the topic to scientific principles, studies, or discoveries that might not be commonly associated with it, offering a scientific lens for readers to explore.",
  "Trace the historical evolution of the topic within different cultures, highlighting how perceptions and practices have shifted over time.",
  "Explore how the topic varies across different regions or countries, shedding light on cultural, environmental, or social influences.",
  "Uncover the symbolic representations associated with the topic in various cultures or belief systems, revealing deeper layers of meaning.",
  "Identify patterns or trends related to the topic that might have gone unnoticed, drawing connections between seemingly unrelated occurrences.",
  "Discuss the semantics of key terms related to the topic, exploring how their meanings have evolved and how they are interpreted across different contexts.",
  "Draw parallels between the topic and historical events, showcasing how lessons from the past can provide insights into current situations.",
  "Examine how language and terminology around the topic have evolved over time, reflecting societal changes and attitudes.",
  "Highlight unconventional or innovative ways the topic is being applied or adapted in various industries or contexts.",
  "Investigate less explored aspects of the topic that might challenge common perceptions or provide fresh insights.",
  "Explore how cognitive biases or psychological phenomena influence perceptions related to the topic.",
  "Investigate how the topic is symbolically represented in myths, folklore, or rituals across different cultures.",
  "Explore how key figures or individuals in history have contributed to shaping the topic and its significance.",
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
