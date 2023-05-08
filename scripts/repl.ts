import prisma from "@/lib/prisma";
import {subHours} from "date-fns";

(async () => {
  console.log("in script repl");
  console.log(subHours(new Date(), 24));
  const websites = await prisma.website.findMany({
    where: {
      // userId: user.id,
      status: true,
      OR: [
        {
          processedOn: {
            lte: subHours(new Date(), 24),
          },
        },
        {
          processedOn: null,
        },
      ],
    },
  });
})();

export {}
