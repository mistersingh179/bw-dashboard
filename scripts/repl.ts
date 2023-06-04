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
  const result = await prisma.website.createMany({
    data: [
      {
        userId: "clhtwckif000098wp207rs2fg",
        topLevelDomainUrl: "http://localhost:8003",
        sitemapUrl: "http://localhost:8000/sitemap.xml",
        status: true,
      },
      {
        userId: "clhtwckif000098wp207rs2fg",
        topLevelDomainUrl: "http://localhost:8000",
        sitemapUrl: "http://localhost:8000/sitemap.xml",
        status: true,
      },
      {
        userId: "clhtwckif000098wp207rs2fg",
        topLevelDomainUrl: "http://localhost:8001",
        sitemapUrl: "http://localhost:8000/sitemap.xml",
        status: true,
      },
    ],
    skipDuplicates: true,
  });
  console.log("result: ", result);
  console.log("*** webpage: ");
})();

export {};
