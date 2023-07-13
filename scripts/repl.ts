import getLogger from "../lib/logger";
import prisma from "@/lib/prisma";
import logger from "../lib/logger";
import { stripHtml } from "string-strip-html";
import createAdvertisementQueue, {
  queueEvents,
} from "@/jobs/queues/createAdvertisementQueue";
import createCategories from "@/services/createCategories";
import {startOfDay} from "date-fns";
import mediumQueue from "@/jobs/queues/mediumQueue";
import mediumWorker from "@/jobs/workers/mediumWorker";

(async () => {

  const before = '(function() { googletag.cmd.push(function() { if(window.innerWidth >= 1000) { googletag.defineSlot(\'/147246189,21780837596/fightbookmma.com_336x336_square_banner_desktop_repeatable\', [[336,336],[336,320],[320,336],[320,320],[300,300],[336,280],[320,250],[300,250]], adID).addService(googletag.pubads()); } else { googletag.defineSlot(\'/147246189,21780837596/fightbookmma.com_336x336_square_banner_mobile_repeatable\', [[336,336],[336,320],[320,336],[320,320],[300,300],[336,280],[320,250],[300,250]], adID).addService(googletag.pubads()); } googletag.display(adID); stpd.initializeAdUnit(adID); }); })); })(); \n' +
    ' HEXAGONE MMA has crowned its first heavyweight world champion. At the close of an exceptional evening, on Saturday 17 June, amidst an electric atmosphere at Reims Arena, Prince Aounallah dominated Paul-Emmanuel Gnaze to win the world title. After an intense back-and-forth, the Frenchman won by technical K-O thanks to some brutal ground and pound before an excited crowd.“I’ve worked hard. This belt goes straight to my heart after everything I’ve put in. He [my opponent] is a beast, he is powerful, he is tough, he does not let go! If I had gone head-on, I would have ran into him, so I had to be cunning. I went for the choke and in the end, it paid off,” commented the brand new champion, belt over shoulder.'

  const after = 'For its return to Reims Arena, one year on from inaugurating the venue, HEXAGONE MMA has once again brought an exceptional show to the region. In front of more than 3000 people, the K-O and spectacular victories followed one after another, most notably among the local fighters. Originating from Reims, star Anthony Dizy sealed his return to the cage with a decision victory over Peruvian Roger Garcia following a three-round war. “I had retired but I thought it would be a shame to go without having fought at home. Ultimately, I just continued doing what I’ve been doing for years.” \n' +
    ' (function() { var randomiser = (Math.random() + 1).toString(36).substring(7); var adID = document.querySelector(\'#fightbookmma_com_double_responsive_repeatable_1\').id = \\"fightbookmma_com_double_responsive_repeatable_1-\\" + randomiser; inView(\'#\' + adID).once(\'enter\', (function() { googletag.cmd.push(function() { if (window.innerWidth >= 1000) { googletag.defineSlot(\'/147246189,21780837596/fightbookmma.com_300x250_double_desktop_r1\', [[300,250],[250,250],[300,300]], adID).addService(googletag.pubads()); } else { googletag.defineSlot(\'/147246189,21780837596/fightbookmma.com_336x336_double_mobile_r1\', [[300,250],[336,336],[336,320],[320,320],[300,300],[336,280],[320,250],[320,336]], adID).addService(googletag.pubads()); } googletag.display(adID); stpd.initializeAdUnit(adID); }); })); })(); (function() { var randomiser = (Math.random()'

  await prisma.advertisementSpot.create({
    data: {
      // webpageId: "clj90j70g0eygmy1q3gmc8rru",
      webpageId: "cljztlhjz0000989k9zgo4awq",
      beforeText: before,
      afterText: after
    }
  });
})();

export {};
