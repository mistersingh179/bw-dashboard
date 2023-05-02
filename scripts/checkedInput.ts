import prisma from "@/lib/prisma";

const main = async () => {
  console.log("hello from main again: ", typeof prisma);
  const user = await prisma.user.findFirstOrThrow();
  console.log("user: ", user);
  // await prisma.campaign.create({
  //   data: {
  //     name: "foo",
  //     start: new Date(),
  //     end: new Date(),
  //     userId:"100",
  //   },
  // });
  await prisma.campaign.create({
    data: {
      name: "foo",
      start: new Date(),
      end: new Date(),
      // user: {
      //   connect: {
      //     // id: user.id
      //     id: "100"
      //   }
      // }
      // userId: "100",
      userId: user.id,
    },
  });

  const webpage = await prisma.webpage.findFirstOrThrow();
  await prisma.webpage.update({
    where: {
      id: webpage.id,
    },
    data: {
      scoredCampaigns: {
        createMany: {
          data: [{ campaignId: "1", score: 2, reason: "Lorem Lipsum" }],
        },
      },
    },
  });
};

main();

export {};
