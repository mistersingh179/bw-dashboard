import prisma from "@/lib/prisma";
import { DEFAULT_SCORE_THRESHOLD } from "@/constants";
import {User} from "next-auth";

const findOrCreateSettings = async (user: User) => {
  const setting = await prisma.setting.upsert({
    where: {
      userId: user.id,
    },
    update: {},
    create: {
      status: true,
      scoreThreshold: DEFAULT_SCORE_THRESHOLD,
      user: {
        connect: {
          id: user.id,
        },
      },
    },
  });
  return setting;
};

export default findOrCreateSettings;
