import { NextApiHandler } from "next";
import withMiddleware from "@/middlewares/withMiddleware";
import { QueryParams } from "@/types/QueryParams";
import prisma from "@/lib/prisma";

const adSpotPreview: NextApiHandler = async (req, res) => {
  const { wpid, wsid } = req.query as QueryParams;
  const userId = req.authenticatedUserId as string;
  const content = await prisma.content.findFirstOrThrow({
    where: {
      webpage: {
        id: wpid,
        website: {
          id: wsid,
          userId: userId,
        },
      },
    },
    select: {
      desktopHtml: true,
    },
  });

  const { NEXT_PUBLIC_BW_SCRIPT_BASE_URL: baseUrl } = process.env;
  const adSpotPreviewScriptTag: string = `<script defer src="${baseUrl}/adSpotPreview.js?id=${userId}"></script>`;

  res.setHeader("Content-Type", "text/html; charset=UTF-8");
  res.send(content.desktopHtml + adSpotPreviewScriptTag);
};

export default withMiddleware("getOnly", "auth")(adSpotPreview);
