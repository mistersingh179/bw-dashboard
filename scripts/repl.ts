import prisma from "@/lib/prisma";

(async () => {
  const userId: string = "clhtwckif000098wp207rs2fg";

  const campaigns = await prisma.campaign.findMany({
    where: {
      OR: [
        {
          categories: {
            some: {
              name: {
                in: ["sr_recipes", "sr_table-talk"],
              },
            },
          },
        },
        {
          categories: {
            none: {},
          },
        },
      ],
    },
    include: {
      categories: true,
    },
  });
  campaigns.map((c) => console.log(c.name));
})();

export {};
