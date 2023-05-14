import prisma from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { subHours } from "date-fns";

(async () => {
  console.log("in script repl");

  console.log(Prisma.AdvertisementScalarFieldEnum);
  console.log(
    Prisma.dmmf.datamodel.models
      .find((x) => x.name === "Advertisement")
      ?.fields.filter(x => x.kind === "scalar").map((x) => x.name) ?? []
  );

  // await prisma.advertisement.findFirstOrThrow();
})();

export {};
