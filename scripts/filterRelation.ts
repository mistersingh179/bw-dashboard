import prisma from "@/lib/prisma";

(async () => {
  const users = await prisma.user.findMany({
    include: {
      websites: {
        where: {
          status: false
        }
      }
    },
  });

  console.log("users: ", users);
})();

export {};
