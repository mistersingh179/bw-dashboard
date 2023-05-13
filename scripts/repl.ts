import prisma from "@/lib/prisma";
import { subHours } from "date-fns";

(async () => {
  console.log("in script repl");

  const campaign = await prisma.campaign.findFirstOrThrow({
    where: {
      id: "clhj35csx000q984wldc9p089",
    },
    include: {
      categories: true,
    },
  });
  console.log(campaign);

  await prisma.campaign.update({
    where: {
      id: "clhj35csx000q984wldc9p089",
    },
    data: {
      categories: {
        set: [
          { id: "clhkh7rah000598flsr1bz4a9" },
          { id: "clhkh730m000398ezhlq4249t" },
        ],
      },
    },
  });

  const campaignAfter = await prisma.campaign.findFirstOrThrow({
    where: {
      id: "clhj35csx000q984wldc9p089",
    },
    include: {
      categories: true,
    },
  });
  console.log(campaignAfter);
})();

export {};
