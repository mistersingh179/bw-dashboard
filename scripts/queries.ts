import prisma from "@/lib/prisma";

const queries = async () => {
  console.log("in queries");
  const campaign = await prisma.campaign.findFirst(
    {
      where: {
        userId: "clfqyzo1z000k98fclzdb0h0e",
        start: {
          lte: new Date()
        },
        impressionCap: {
          gte: 1000
        },
        status: true
      },
      select: {
        id: true,
        start: true,
        end: true
      }
    }
  );
  console.log(campaign);
}

(async() => {
  await queries();
})()

export default queries;