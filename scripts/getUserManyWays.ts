import prisma from "@/lib/prisma";
import webpages from "@/pages/api/websites/[wsid]/webpages";

(async () => {
  console.log("in findUserManyWays");

  const webpageId = (await prisma.webpage.findFirstOrThrow()).id;
  console.log("webpageId: ", webpageId);

  const user1 = (await prisma.webpage.findFirstOrThrow({
    where: {id: webpageId},
    include: {
      website: {
        include: {
          user: true
        }
      }
    }
  })).website.user;
  console.log("user1: ", user1);

  const user2 = await prisma.user.findFirstOrThrow({
    where: {
      websites: {
        some: {
          webpages: {
            some: {
              id: webpageId
            }
          }
        }
      }
    },
  })

  console.log("user2: ", user2);



})();

export {}