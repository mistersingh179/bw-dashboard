import prisma from "@/lib/prisma";
import { Prisma, Setting } from "@prisma/client";
import { subHours } from "date-fns";

(async () => {
  await prisma.webpage.deleteMany();
})();

export {};
