import prisma from "@/lib/prisma";
import {DEFAULT_SCORE_THRESHOLD} from "@/constants";

(async () => {
  const setting = await prisma.setting.upsert({
    where: {
      userId: "clfqyzo1z000k98fclzdb0h0e",
    },
    update: {},
    create: {
      status: true,
      scoreThreshold: DEFAULT_SCORE_THRESHOLD,
      userId: "clfqyzo1z000k98fclzdb0h0e"
    }
  })
})();