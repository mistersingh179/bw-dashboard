import prisma from "@/lib/prisma";

(async () => {
  console.log("in getWebpages");
  const webpages = await prisma.webpage.findMany(
    {
      where: {
        website: {
          user: {
            id: "clfqyzo1z000k98fclzdb0h0e"
          }
        }
      }
    }
  );
  console.log("webpages: ", webpages);
})();

export {}