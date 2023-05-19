import prisma from "@/lib/prisma";
import { Prisma, Setting } from "@prisma/client";
import { subHours } from "date-fns";

(async () => {
  const x = await prisma.impression.findFirstOrThrow({
    where: {
      id: "clhui38ky001r98wpa4d34hs7"
    }
  });
  console.log(x);
})();

export {};
