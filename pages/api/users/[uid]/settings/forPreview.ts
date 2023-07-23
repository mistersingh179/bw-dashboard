import { NextApiHandler } from "next";
import withMiddleware from "@/middlewares/withMiddleware";
import prisma from "@/lib/prisma";
import superjson from "superjson";
import { QueryParams } from "@/types/QueryParams";
import Cors from "cors";

const cors = Cors({
  credentials: true,
  origin: (requestOrigin, callback) => {
    callback(null, requestOrigin);
  },
});

const forPreview: NextApiHandler = async (req, res) => {
  const query = req.query as QueryParams;
  const uid = query.uid ?? "";

  const settings = await prisma.setting.findFirstOrThrow({
    where: {
      userId: uid,
    },
    select: {
      contentSelector: true,
      minCharLimit: true,
      sameTypeElemWithTextToFollow: true,
      desiredAdvertisementSpotCount: true,
    },
  });

  res
    .setHeader("Content-Type", "application/json")
    .status(200)
    .send(superjson.stringify(settings));
};

// @ts-ignore
export default withMiddleware(cors, "getOnly")(forPreview);
