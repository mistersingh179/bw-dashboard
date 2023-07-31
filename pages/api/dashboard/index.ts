import { NextApiHandler } from "next";
import prisma from "@/lib/prisma";
import withMiddleware from "@/middlewares/withMiddleware";
import superjson from "superjson";
import { Prisma } from "@prisma/client";

type CountType = {count: number};

const dashboard: NextApiHandler = async (req, res) => {
  const userId = req.authenticatedUserId || "";

  const auctionsCountSql = Prisma.sql`
      select count(*) as "count"
      from "Auction" 
      where "userId"= ${userId}`;

  const auctions = await prisma.$queryRaw<CountType[]>(auctionsCountSql);

  const impressionsCountSql = Prisma.sql`
      select count(*) as "count"
      from "Impression" 
      inner join "Auction" A on A.id = "Impression"."auctionId"
      where "userId"= ${userId}`;

  const impressions = await prisma.$queryRaw<CountType[]>(impressionsCountSql);

  const clicksCountSql = Prisma.sql`
      select count(*) as "count"
      from "Impression" 
      inner join "Auction" A on A.id = "Impression"."auctionId" and "Impression".clicked=true
      where "userId"= ${userId}`;

  const clicks = await prisma.$queryRaw<CountType[]>(clicksCountSql);

  res
    .setHeader("Content-Type", "application/json")
    .status(200)
    .send(
      superjson.stringify({
        auctionsCount: auctions[0].count,
        impressionsCount: impressions[0].count,
        clicksCount: clicks[0].count,
      })
    );
};

export default withMiddleware("getOnly", "auth")(dashboard);
