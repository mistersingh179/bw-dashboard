import { NextApiHandler, NextApiRequest, NextApiResponse } from "next";
import prisma from "@/lib/prisma";
import withMiddleware from "@/middlewares/withMiddleware";
import getScalarFieldsOfModel from "@/lib/getScalarFieldsOfModel";
import { omit, pick } from "lodash";
import { Prisma } from ".prisma/client";
import WebsiteFeedbackUncheckedCreateInput = Prisma.WebsiteFeedbackUncheckedCreateInput;

type AuctionResponseData = {
  message: string;
};

const websiteFeedback: NextApiHandler = async (req, res) => {
  switch (req.method) {
    case "POST":
      await handleCreateWebsiteFeedback(req, res);
      break;
  }
};

export default withMiddleware("postOnly", "rejectBots")(websiteFeedback);

const handleCreateWebsiteFeedback = async (
  req: NextApiRequest,
  res: NextApiResponse
) => {
  req.body.optOut = req.body.optOut === "true" ? true : false;
  if(req.body.metaContentImpressionId === ""){
    req.body.metaContentImpressionId = undefined;
  }
  const notAllowedAttributes = ["updatedAt", "createdAt"];
  const allowedAttributes = getScalarFieldsOfModel("WebsiteFeedback");
  let data = pick<WebsiteFeedbackUncheckedCreateInput>(
    req.body,
    allowedAttributes
  );
  data = omit<WebsiteFeedbackUncheckedCreateInput>(data, notAllowedAttributes);
  const websiteFeedback = await prisma.websiteFeedback.create({
    data,
  });

  res.redirect("https://brandweaver.ai/thanks-for-your-feedback/");
};
