import { NextApiHandler, NextApiRequest, NextApiResponse } from "next";
import withMiddleware from "@/middlewares/withMiddleware";
import { QueryParams } from "@/types/QueryParams";
import prisma from "@/lib/prisma";
import superjson from "superjson";
import { omit } from "lodash";

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

  if (req.body["topLevelDomainUrl"]?.endsWith("/")) {
    req.body["topLevelDomainUrl"] = req.body["topLevelDomainUrl"].slice(0, -1);
  }

  const notAllowedAttributes = ["userId", "updatedAt", "createdAt"];
  const data = omit(req.body, notAllowedAttributes) as any;

  const website = await prisma.website.update({
    where: {
      id: wsid,
      userId: req.authenticatedUserId,
    },
    data,
  });
  res
    .setHeader("Content-Type", "application/json")
    .status(200)
    .send(superjson.stringify(website));
};

export default withMiddleware("getPutDeleteOnly", "auth")(website);
