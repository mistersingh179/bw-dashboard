import { NextApiHandler, NextApiRequest, NextApiResponse } from "next";
import prisma from "@/lib/prisma";
import withMiddleware from "@/middlewares/withMiddleware";
import getScalarFieldsOfModel from "@/lib/getScalarFieldsOfModel";
import { omit, pick } from "lodash";
import { Prisma } from ".prisma/client";
import WebsiteFeedbackUncheckedCreateInput = Prisma.WebsiteFeedbackUncheckedCreateInput;
import cookie from "cookie";
import { OPT_OUT_COOKIE_NAME } from "@/constants";

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
  if (req.body.metaContentImpressionId === "") {
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
  if (websiteFeedback.optOut === true) {
    const cookieHeaderString = cookie.serialize(OPT_OUT_COOKIE_NAME, "true", {
      path: "/",
      httpOnly: true,
      maxAge: 2147483647,
      sameSite: "none",
      secure: true,
    });
    res.setHeader("Set-Cookie", cookieHeaderString);
  }else{
    const cookieHeaderString = cookie.serialize(OPT_OUT_COOKIE_NAME, "false", {
      path: "/",
      httpOnly: true,
      maxAge: 0,
      sameSite: "none",
      secure: true,
    });
    res.setHeader("Set-Cookie", cookieHeaderString);
  }

  res.redirect("https://brandweaver.ai/thanks-for-your-feedback/?foo");
};
