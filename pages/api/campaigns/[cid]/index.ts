import { NextApiHandler, NextApiRequest, NextApiResponse } from "next";
import prisma from "@/lib/prisma";
import { QueryParams } from "@/types/QueryParams";
import { formatISO, parseISO } from "date-fns";
import withMiddleware from "@/middlewares/withMiddleware";
import superjson from "superjson";

const campaign: NextApiHandler = async (req, res) => {
  if (req.method === "GET") {
    await handleShowCampaign(req, res);
  } else if (req.method === "PUT") {
    await handleUpdateCampaign(req, res);
  } else if (req.method === "DELETE") {
    await handleDeleteCampaign(req, res);
  }
};

export default withMiddleware("getPutDeleteOnly", "auth")(campaign);

const handleUpdateCampaign = async (
  req: NextApiRequest,
  res: NextApiResponse
) => {
  const query = req.query as QueryParams;
  const cid = query.cid;

  // const {
  //   name,
  //   start,
  //   end,
  //   impressionCap,
  //   fixedCpm,
  //   productName,
  //   productDescription,
  //   clickUrl,
  //   requiredCssSelector,
  //   pacing,
  //   status,
  // } = req.body;

  const { start, end } = req.body;
  const startWithTime = formatISO(parseISO(start));
  const endWithTime = formatISO(parseISO(end));

  const campaign = await prisma.campaign.update({
    where: {
      id: cid,
      user: {
        id: req.authenticatedUserId,
      },
    },
    data: {
      ...req.body,
      start: startWithTime,
      end: endWithTime,
    },
  });

  res
    .setHeader("Content-Type", "application/json")
    .status(200)
    .send(superjson.stringify(campaign));
};

const handleShowCampaign = async (
  req: NextApiRequest,
  res: NextApiResponse
) => {
  const query = req.query as QueryParams;
  const cid = query.cid;

  const campaign = await prisma.campaign.findFirstOrThrow({
    where: {
      id: cid,
      userId: req.authenticatedUserId || "",
    },
  });

  res
    .setHeader("Content-Type", "application/json")
    .status(200)
    .send(superjson.stringify(campaign));
};

const handleDeleteCampaign = async (
  req: NextApiRequest,
  res: NextApiResponse
) => {
  const query = req.query as QueryParams;
  const cid = query.cid;

  await prisma.campaign.delete({
    where: {
      id: cid,
      userId: req.authenticatedUserId || "",
    },
  });

  res.status(200).end();
};
