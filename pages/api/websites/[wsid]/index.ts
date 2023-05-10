import { NextApiHandler, NextApiRequest, NextApiResponse } from "next";
import withMiddleware from "@/middlewares/withMiddleware";
import { QueryParams } from "@/types/QueryParams";
import prisma from "@/lib/prisma";
import superjson from "superjson";

const website: NextApiHandler = async (req, res) => {
  switch (req.method) {
    case "PUT":
      await handleWebsiteUpdate(req, res);
      break;
  }
};

const handleWebsiteUpdate = async (
  req: NextApiRequest,
  res: NextApiResponse
) => {
  const { wsid } = req.query as QueryParams;
  const website = await prisma.website.update({
    where: {
      id: wsid,
      userId: req.authenticatedUserId,
    },
    data: {
      ...req.body
    }
  });
  console.log("updated website is: ", website);
  res
    .setHeader("Content-Type", "application/json")
    .status(200)
    .send(superjson.stringify(website));
};

export default withMiddleware("getPutDeleteOnly", "auth")(website);
