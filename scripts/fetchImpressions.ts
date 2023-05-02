import prisma from "@/lib/prisma";

const main = async () => {
  console.log("hello from main again: ", typeof prisma);
  const impressions = await prisma.impression.findMany({
    where: {
      campaign: {
        user: {
          id: "clfqyzo1z000k98fclzdb0h0e"
        }
      }
    }
  })
  console.log("impressions: ", impressions);
};

main();

export {};
