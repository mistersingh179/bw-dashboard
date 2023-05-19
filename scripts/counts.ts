import prisma from "@/lib/prisma";

(async () => {
  await prisma.webpage.deleteMany();

  // await prisma.webpage.deleteMany({
  //   where: {
  //     websiteId: "clh58j7rl000z98kwx3diilzx"
  //   }
  // });

  const ans = await prisma.impression.count({
    where: {
      campaign: {
        userId: "clfqyzo1z000k98fclzdb0h0e"
      }
    }
  })

  console.log("ans: ", ans)
})()