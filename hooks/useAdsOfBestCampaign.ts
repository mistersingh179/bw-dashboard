import useSWR from "swr";
import fetcher from "@/helpers/fetcher";
import { AdvertisementWithSpotAndCampaign } from "@/pages/api/websites/[wsid]/webpages/[wpid]/adsOfBestCampaign";

const useAdsOfBestCampaign = (
  wsid: string | undefined,
  wpid: string | undefined
) => {
  const {
    data: advertisements,
    error,
    isLoading,
  } = useSWR<AdvertisementWithSpotAndCampaign[]>(
    wsid && wpid
      ? `/api/websites/${wsid}/webpages/${wpid}/adsOfBestCampaign`
      : null,
    fetcher
  );

  return { advertisements, error, isLoading };
};

export default useAdsOfBestCampaign;
