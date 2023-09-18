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
  console.log(process.env.NEW_RELIC_APP_NAME)
  console.log("***");
})();

export {};
