import prisma from "@/lib/prisma";

(async () => {
  const userId: string = "clhtwckif000098wp207rs2fg";

  const users = await prisma.user.findMany({
    include: {
      setting: true,
    },
  });
  console.log(
    users.length,
    users.map((u) => u.email)
  );
  for (const u of users) {
    console.log(u.email, u.setting);
  }
})();

export {};
