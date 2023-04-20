import { NextApiHandler, NextApiRequest, NextApiResponse } from "next";
import campaigns from "@/pages/api/campaigns/index";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/pages/api/auth/[...nextauth]";
import { Campaign } from "@prisma/client";
import { sleep } from "@/pages/api/dashboard";
import { QueryParams } from "@/types/QueryParams";
import { formatISO, parseISO } from "date-fns";
import withMiddleware from "@/middlewares/my-middleware";
import { Middleware } from "next-api-middleware";
import allowedMethodMiddlewareFactory from "@/middlewares/allowedMethodMiddlewareFactory";

const campaign: NextApiHandler = async (req, res) => {
  if (req.method === "GET") {
    await handleShowCampaign(req, res);
  } else if (req.method === "PUT") {
    await handleUpdateCampaign(req, res);
  } else if (req.method === "DELETE") {
    await handleDeleteCampaign(req, res);
  }
};

const allowedMethodMiddleware: Middleware = allowedMethodMiddlewareFactory([
  "GET",
  "PUT",
  "DELETE",
]);

export default withMiddleware(allowedMethodMiddleware)(campaign);

const handleUpdateCampaign = async (
  req: NextApiRequest,
  res: NextApiResponse
) => {
  const session = await getServerSession(req, res, authOptions);
  if (!session) {
    res.status(401).end();
    return;
  }

  const query = req.query as QueryParams;
  const cid = query.cid;
  console.log("in edit campaign with: ", cid, session.user.id);

  const { name, start, end } = req.body;
  const startWithTime = formatISO(parseISO(start));
  const endWithTime = formatISO(parseISO(end));

  const campaign = await prisma.campaign.update({
    where: {
      id: cid,
      userId: session.user.id,
    },
    data: {
      name,
      start: startWithTime,
      end: endWithTime,
    },
  });

  console.log("sending back campaign: ", campaign);

  res.status(200).json(campaign);
};

const handleShowCampaign = async (
  req: NextApiRequest,
  res: NextApiResponse
) => {
  const session = await getServerSession(req, res, authOptions);
  if (!session) {
    res.status(401).end();
    return;
  }

  const query = req.query as QueryParams;
  const cid = query.cid;
  console.log("in show campaign with: ", cid, session.user.id);

  const campaign = await prisma.campaign.findFirstOrThrow({
    where: {
      id: cid,
      userId: session.user.id,
    },
  });

  console.log("sending back campaign: ", campaign);

  res.status(200).json(campaign);
};

const handleDeleteCampaign = async (
  req: NextApiRequest,
  res: NextApiResponse
) => {
  const session = await getServerSession(req, res, authOptions);
  if (!session) {
    res.status(401).end();
    return;
  }

  sleep(2000);

  const query = req.query as QueryParams;
  const cid = query.cid;
  console.log("in delete campaign with: ", cid, session.user.id);

  await prisma.campaign.delete({
    where: {
      id: cid,
      userId: session.user.id,
    },
  });

  res.status(204).end();
};
