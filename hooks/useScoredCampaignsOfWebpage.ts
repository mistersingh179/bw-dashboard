import useTxToast from "@/hooks/useTxToast";
import useSWR from "swr";
import { WebpageType } from "@/types/my-types";
import fetcher from "@/helpers/fetcher";
import React from "react";
import superjson from "superjson";
import { Category } from ".prisma/client";
import { ScoredCampaign } from "@prisma/client";
import {ScoredCampaignWithCampaign} from "@/pages/api/websites/[wsid]/webpages/[wpid]/scoredCampaigns";

const useScoredCampaignsOfWebpage = (
  wsid: string,
  wpid: string,
  page: number,
  pageSize: number
) => {
  const {
    data: scoredCampaigns,
    error,
    isLoading,
  } = useSWR<ScoredCampaignWithCampaign[]>(
    wsid && wpid
      ? `/api/websites/${wsid}/webpages/${wpid}/scoredCampaigns?page=${page}&pageSize=${pageSize}`
      : null,
    fetcher
  );

  return { scoredCampaigns, error, isLoading };
};

export default useScoredCampaignsOfWebpage;
