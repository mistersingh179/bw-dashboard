import useSWR from "swr";
import fetcher from "@/helpers/fetcher";
import { AdvertisementWithSpotAndCampaign } from "@/pages/api/websites/[wsid]/webpages/[wpid]/adsOfBestCampaign";
import { CampWithImpCount } from "@/services/queries/getCampaignsWithTheirImpressionCount";
import AnyObject from "@/types/AnyObject";

const useCampWithImpCount = () => {
  const { data, error, isLoading } = useSWR<CampWithImpCount[]>(
    `/api/campaigns/impressionCounts`,
    fetcher
  );
  let hash: { [key: string]: number } = {};
  if (data) {
    data.reduce((acc, cv) => {
      acc[cv.id] = cv.impressionsCount;
      return acc;
    }, hash);
  }

  return {
    campsWithImpCount: hash,
    error,
    isLoading,
  };
};

export default useCampWithImpCount;
