import getScalarFieldsOfModel from "@/lib/getScalarFieldsOfModel";
import prisma from "@/lib/prisma";

const foo = () => {
  return new Promise((resolve, reject) => {
    setTimeout(resolve, 1000);
  });
};

const bar = () => {
  return new Promise((resolve, reject) => {
    setTimeout(reject, 10);
  });
};

(async () => {
  const webpage = await prisma.webpage.findFirstOrThrow({
    where: {
      id: "clhuouuc4000098p20fvjm1if",
    },
    include: {
      website: {
        include: {
          user: {
            include: {
              setting: true,
              campaigns: true,
              _count: {
                select: {
                  campaigns: true
                }
              }
            },
          },
        },
      },
      // content: true,
      _count: {
        select: {
          categories: true,
          advertisementSpots: true,
          scoredCampaigns: true,
        },
      },
    },
  });

  console.log("*** webpage: ");
  console.log(webpage.website.user._count.campaigns)
})();

export {};
