import { NextApiHandler, NextApiRequest, NextApiResponse } from "next";
import withMiddleware from "@/middlewares/withMiddleware";
import { Campaign, Setting } from "@prisma/client";
import { formatISO, parseISO } from "date-fns";
import prisma from "@/lib/prisma";
import superjson from "superjson";
import { omit } from "lodash";

const settings: NextApiHandler = async (req, res) => {
  switch (req.method) {
    case "GET":
      await handleShowSettings(req, res);
      break;
    case "PUT":
      await handleCreateOrUpdateSettings(req, res);
      break;
  }
};

export default withMiddleware("getPutDeleteOnly", "auth")(settings);

const handleCreateOrUpdateSettings = async (
  req: NextApiRequest,
  res: NextApiResponse
) => {
  const notAllowedAttributes = ["userId"];
  const data = omit(req.body, notAllowedAttributes) as any;
  const userWithSetting = await prisma.user.update({
    where: {
      id: req.authenticatedUserId,
    },
    data: {
      setting: {
        upsert: {
          update: { ...data },
          create: { ...data } ,
        },
      },
    },
    include: {
      setting: true,
    },
  });

  res
    .setHeader("Content-Type", "application/json")
    .status(200)
    .send(superjson.stringify(userWithSetting.setting));
};

const handleShowSettings = async (
  req: NextApiRequest,
  res: NextApiResponse
) => {
  const setting = await prisma.setting.findFirstOrThrow({
    where: {
      user: {
        id: req.authenticatedUserId,
      },
    },
  });
  res
    .setHeader("Content-Type", "application/json")
    .status(200)
    .send(superjson.stringify(setting));
};
