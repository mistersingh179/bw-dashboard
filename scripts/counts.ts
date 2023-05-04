import prisma from "@/lib/prisma";

(async () => {
  await prisma.webpage.deleteMany();

  // await prisma.webpage.deleteMany({
  //   where: {
  //     websiteId: "clh58j7rl000z98kwx3diilzx"
  //   }
  // });

  const ans = await prisma.website.findFirstOrThrow({
    where: {
      id: "clh58j7rl000z98kwx3diilzx"
    },
    include: {
      _count: {
        select: {
          webpages: true
        }
      }
    }
  });
  console.log("Website ", ans.sitemapUrl, " has ", ans._count.webpages, " webpages");
})()