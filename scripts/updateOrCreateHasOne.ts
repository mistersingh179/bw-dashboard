import prisma from "@/lib/prisma";

(async () => {
  console.log("in update or create has one");
  const user = await prisma.user.findFirstOrThrow();
  const userId = user.id;
  console.log("userId: ", userId);

  const userAfterUpdate = await prisma.user.update({
    where: {
      id: userId,
    },
    data: {
      setting: {
        upsert: {
          update: {
            status: false,
          },
          create: {
            status: true,
            scoreThreshold: 5
          }
        },
      },
    },
  });

  console.log("userAfterUpdate: ", userAfterUpdate);
})();

export {};
