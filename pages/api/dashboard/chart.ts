import {NextApiHandler} from "next";
import {subMonths} from "date-fns";
import {Prisma} from "@prisma/client";
import prisma from "@/lib/prisma";
import superjson from "superjson";
import withMiddleware from "@/middlewares/withMiddleware";

export type ChartItemType = {
  date: Date,
  auctions: number,
  impressions: number,
  clicks: number,
}


const chart: NextApiHandler = async (req, res) => {
  const userId = req.authenticatedUserId ?? "";
  const now = new Date();
  const monthAgo = subMonths(now, 6);

  const sql = Prisma.sql`
      select date("Auction"."createdAt") as date,
             count("Auction".id) as auctions,
             count(I.id)         as impressions,
             count(C.id)         as clicks
      from "Auction"
               left join "Impression" I on "Auction".id = I."auctionId"
               left join "Impression" C on "Auction".id = C."auctionId" and C.clicked = true
      where "userId" = ${userId}
        and "Auction"."createdAt" >= ${monthAgo}
        and "Auction"."createdAt" <= ${now}
      group by (date("Auction"."createdAt"))
      order by date ASC
      ;
  `;

  const ans = await prisma.$queryRaw<ChartItemType[]>(sql);

  res
    .setHeader("Content-Type", "application/json")
    .status(200)
    .send(
      superjson.stringify(ans)
    );
}

export default withMiddleware("getOnly", "auth")(chart);
