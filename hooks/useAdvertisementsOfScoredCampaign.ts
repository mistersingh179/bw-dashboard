import useTxToast from "@/hooks/useTxToast";
import useSWR from "swr";
import { WebpageType } from "@/types/my-types";
import fetcher from "@/helpers/fetcher";
import React from "react";
import superjson from "superjson";
import { Category } from ".prisma/client";
import { ScoredCampaign } from "@prisma/client";
import {ScoredCampaignWithCampaign} from "@/pages/api/websites/[wsid]/webpages/[wpid]/scoredCampaigns";
import {AdvertisementWithSpotAndCampaign} from "@/pages/api/websites/[wsid]/webpages/[wpid]/adsOfBestCampaign";

const useAdvertisementsOfScoredCampaign = (
  wsid: string | undefined,
  wpid: string | undefined,
  scid: string | undefined,
) => {
  const {
    data: advertisements,
    error,
    isLoading,
  } = useSWR<AdvertisementWithSpotAndCampaign[]>(
    wsid && wpid && scid
      ? `/api/websites/${wsid}/webpages/${wpid}/scoredCampaigns/${scid}/advertisements`
      : null,
    fetcher
  );

  return { advertisements, error, isLoading };
};

export default useAdvertisementsOfScoredCampaign;
