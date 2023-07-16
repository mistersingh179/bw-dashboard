import { NextApiHandler, NextApiRequest, NextApiResponse } from "next";
import withMiddleware from "@/middlewares/withMiddleware";
import { QueryParams } from "@/types/QueryParams";
import prisma from "@/lib/prisma";
import superjson from "superjson";
import getScalarFieldsOfModel from "@/lib/getScalarFieldsOfModel";
import { omit, pick } from "lodash";
import { Prisma } from "@prisma/client";
import AdvertisementUncheckedUpdateInput = Prisma.AdvertisementUncheckedUpdateInput;

const advertisement: NextApiHandler = async (req, res) => {
  switch (req.method) {
    case "GET":
      await handleShowAdvertisement(req, res);
      break;
    case "PUT":
      await handleUpdateAdvertisement(req, res);
      break;
  }
};

const handleShowAdvertisement = async (
  req: NextApiRequest,
  res: NextApiResponse
) => {
  const { wsid, wpid, aid } = req.query as QueryParams;
  const advertisement = await prisma.advertisement.findFirstOrThrow({
    where: {
      id: aid,
      advertisementSpot: {
        webpage: {
          id: wpid,
          website: {
            id: wsid,
            user: {
              id: req.authenticatedUserId,
            },
          },
        },
      },
    },
  });
  res
    .setHeader("Content-Type", "application/json")
    .status(200)
    .send(superjson.stringify(advertisement));
};

const handleUpdateAdvertisement = async (
  req: NextApiRequest,
  res: NextApiResponse
) => {
  const { wsid, wpid, aid } = req.query as QueryParams;

  const notAllowedAttributes = ["userId", "updatedAt", "createdAt"];
  const allowedAttributes = getScalarFieldsOfModel("Advertisement");
  let data = pick<AdvertisementUncheckedUpdateInput>(
    req.body,
    allowedAttributes
  );
  data = omit<AdvertisementUncheckedUpdateInput>(data, notAllowedAttributes);

  const advertisement = await prisma.advertisement.update({
    where: {
      id: aid,
      advertisementSpot: {
        webpage: {
          id: wpid,
          website: {
            id: wsid,
            user: {
              id: req.authenticatedUserId,
            },
          },
        },
      },
    },
    data,
  });
  res
    .setHeader("Content-Type", "application/json")
    .status(200)
    .send(superjson.stringify(advertisement));
};

export default withMiddleware("getPutDeleteOnly", "auth")(advertisement);
