import getLogger from "../lib/logger";
import prisma from "@/lib/prisma";
import logger from "../lib/logger";
import { stripHtml } from "string-strip-html";
import createAdvertisementQueue, {
  queueEvents,
} from "@/jobs/queues/createAdvertisementQueue";
import getCampaignsWhoHaveNotMetImpCap from "@/services/queries/getCamapignsWhoHaveNotMetImpCap";
import redisClient from "@/lib/redisClient";

import { User, Prisma } from "@prisma/client";
import { subMonths } from "date-fns";
import processWebpageQueue from "@/jobs/queues/processWebpageQueue";
import MediumQueue from "@/jobs/queues/mediumQueue";
import mediumQueue, {
  queueEvents as MediumQueueEvent,
} from "@/jobs/queues/mediumQueue";
import {
  DIVERSITY_CLASSIFIER,
  META_CONTENT_BUILD_FAIL_COUNT_LIMIT,
} from "@/constants";

prisma.$on("query", (e) => {
  const { timestamp, query, params, duration, target } = e;
  console.log(query);
  console.log({ timestamp, params, duration, target });
});

const contentType = 'foo';

const metaContentSpotText = 'bar'

const cleanupWordRegex =
  /^(Original text|Box|Technological Fact|Musical Fact|Scientific Fact|Cultural Fact|Economic Fact|Boxed Content|Cognitive Bias|Supplementary Content|Cultural References|Future Trends|Historical Exploration|Scientific Connection|Literature Review|Economic Impact|Cultural Evolution|Geographical Insights|Symbolism and Iconography|Pattern Recognition|Semantic Analysis|Historical Parallels|Moral and Ethical Considerations|Language Evolution|Innovative Applications|Unexplored Dimensions|Cognitive Psychology|Environmental Impact|Cultural Symbolism|Biographical Lens):/im;

(async () => {
  console.log("***");
  let output = `Cognitive Bias: The Halo Effect\\n\\nCognitive Bias:The Halo Effect is a cognitive bias that can influence our perceptions when it comes to adopting animals. This bias occurs when we attribute positive qualities to a person or, in this case, an animal, based on one outstanding trait or characteristic. \\n\\nfoo\\n\\nbar\\n\\nFor example, when we see a photo of an adorable puppy with big, soulful eyes, we may automatically assume that the puppy is friendly, well-behaved, and easy to train. This positive perception can cloud our judgment and make us more inclined to adopt the puppy without considering other factors, such as its energy level or compatibility with our lifestyle.\\n\\nIn the context of the animals showcased by Best Friends Animal Society, it's important to be aware of the Halo Effect and not let it solely guide our decision to adopt. While these animals have been waiting for their forever homes for an extended period, it's crucial to take a holistic approach and consider their individual needs, temperaments, and any potential challenges they may present.\\n\\nBy acknowledging the Halo Effect and consciously evaluating a pet's suitability based on a range of factors, we can ensure that our adoption decision is well-informed and ultimately beneficial for both the animal and ourselves.`;

  let pars = output.split("\\n");
  pars = pars.filter(para => para != '')
  pars = pars.map(para => para.replace(cleanupWordRegex, ""));
  pars = pars.map(para => para.trim());
  pars = pars.filter(para => para != contentType);
  pars = pars.filter(para => para != metaContentSpotText);
  output = pars.join("\\n");
  output = output.trim();

  console.log(output);
})();

export {};
