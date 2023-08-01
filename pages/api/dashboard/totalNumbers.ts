import { NextApiHandler } from "next";
import prisma from "@/lib/prisma";
import withMiddleware from "@/middlewares/withMiddleware";
import superjson from "superjson";
import { Prisma } from "@prisma/client";

export type TotalNumbersType = {
  auctions: number;
  impressions: number;
  clicks: number;
};

const dashboard: NextApiHandler = async (req, res) => {
  const userId = req.authenticatedUserId || "";

  const auctionsCountSql = Prisma.sql`
      select count(*) as "count"
      from "Auction" 
      where "userId"= ${userId}`;

  const auctions = await prisma.$queryRaw<{ count: number }[]>(
    auctionsCountSql
  );

  const impressionsCountSql = Prisma.sql`
      select count(*) as "count"
      from "Impression" 
      inner join "Auction" A on A.id = "Impression"."auctionId"
      where "userId"= ${userId}`;

  const impressions = await prisma.$queryRaw<{ count: number }[]>(
    impressionsCountSql
  );

  const clicksCountSql = Prisma.sql`
      select count(*) as "count"
      from "Impression" 
      inner join "Auction" A on A.id = "Impression"."auctionId" and "Impression".clicked=true
      where "userId"= ${userId}`;

  const clicks = await prisma.$queryRaw<{ count: number }[]>(clicksCountSql);

  const result: TotalNumbersType = {
    auctions: auctions[0].count,
    impressions: impressions[0].count,
    clicks: clicks[0].count,
  };

  res
    .setHeader("Content-Type", "application/json")
    .status(200)
    .send(superjson.stringify(result));
};

export default withMiddleware("getOnly", "auth")(dashboard);
