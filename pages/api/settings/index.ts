import { NextApiHandler, NextApiRequest, NextApiResponse } from "next";
import withMiddleware from "@/middlewares/withMiddleware";
import { Campaign, Setting } from "@prisma/client";
import { formatISO, parseISO } from "date-fns";
import prisma from "@/lib/prisma";

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
  res: NextApiResponse<Setting>
) => {
  const { status, scoreThreshold } = req.body;
  const userWithSetting = await prisma.user.update({
    where: {
      id: req.authenticatedUserId,
    },
    data: {
      setting: {
        upsert: {
          update: {
            ...req.body
          },
          create: {
            ...req.body
          }
        },
      },
    },
    include: {
      setting: true
    }
  });
  res.json(userWithSetting.setting as Setting);
};

const handleShowSettings = async (
  req: NextApiRequest,
  res: NextApiResponse<Setting>
) => {
  const setting = await prisma.setting.findFirstOrThrow({
    where: {
      user: {
        id: req.authenticatedUserId,
      },
    },
  });
  console.log("setting: ", setting);
  res.status(200).json(setting);
};
