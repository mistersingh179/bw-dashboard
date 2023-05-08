import prisma from "@/lib/prisma";

(async () => {
  console.log("in script");
  await prisma.user.update({
    where: {
      id: "clh7qurg9000098q85mm34hxv",
    },
    data: {
      auctions: {
        createMany: {
          data: [
            {
              url: "foo",
            },
            {
              url: "bar",
            },
          ],
          skipDuplicates: true,
        },
      },
    },
  });
})();

export {};
