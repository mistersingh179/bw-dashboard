import prisma from "@/lib/prisma";

const main = async () => {
  console.log("hello from main again: ", typeof prisma);
  const user = await prisma.user.findFirstOrThrow();
  console.log("user: ", user);
  const campaigns = await prisma.user.findFirstOrThrow().campaigns();
  console.log("campaigns: ", campaigns);
  const websiteUrls = await prisma.user.findFirstOrThrow({
    include: {
      websiteUrls: true,
    },
  });
  console.log("websiteUrls: ", websiteUrls);

};

main();

export {};
