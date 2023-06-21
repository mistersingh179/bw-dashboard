import getLogger from "../lib/logger";
import prisma from "@/lib/prisma";
import logger from "../lib/logger";
import { stripHtml } from "string-strip-html";
import createAdvertisementQueue, {
  queueEvents,
} from "@/jobs/queues/createAdvertisementQueue";

(async () => {
  const ans =
    "14 Homemade Pizza Recipes for Family Movie Night FEATURED IN: \n What to do when your 8-year old nephew comes to visit? Make pizza, of course! \n Well, not of course, actually. I didn't think of it until we exhausted Sorry, Monopoly, and gin rummy. But it did turn out to be a brilliant idea as my father had just received a baking stone for Christmas, and my nephew loves pizza. \n I told him if he helped me make it I would talk about him on my website and he would be famous. That seemed to get his attention. He thought the dough was \"slimy and gross\" but he loved picking his own toppings, and the finished product was \"awesome\". \n Simply Recipes / Annika Panikker \n My Favorite Pizza Dough Recipe \n ";
  const paras = ans.split(" \n ");
  console.log(paras.length);
  console.log(paras)
})();

export {};
