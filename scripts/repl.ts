import getLogger from "../lib/logger";
import prisma from "@/lib/prisma";
import logger from "../lib/logger";
import { stripHtml } from "string-strip-html";
import createAdvertisementQueue, {
  queueEvents,
} from "@/jobs/queues/createAdvertisementQueue";

(async () => {
  const ans = "the cameras. And that’s okay. That’s no problem. I respect him as a fighter, but on Saturday night, I will be champion.”Bob Arum“It’s been a great run with Mick. He’s a terrific young man. He is a really good fighter, and he’s stepping to the plate against a really tough world champion in Luis Alberto Lopez, who doesn’t hesitate to go into his opponent’s hometown and perform spectacularly. Mick knows it’s not going to be an easy fight. It’s going to be a very tough fight. All the people here in Belfast will have the opportunity to watch a classic, competitive championship fight. It may end up being the fight of the year.” \n try { top.udm_inpage_sid = 19345; } catch (e) { console.warn(\"Error initializing udm inpage. Please verify you are not using an unfriendly iframe\"); } \n Luis Alberto Lopez and Michael Conlan (ESPN+ (1:30 p.m. ET/10:30 a.m. PT):";
  const paras = ans.split(" \n ");
  for(const para of paras){
    const words = para.split(" ");
    console.log("words.length: ", words.length);
  }
  console.log("sadf asfsderwq axc f fsad ".slice(-10));

})();

export {};
