import useSWR from "swr";
import fetcher from "@/helpers/fetcher";
import { WebpageWithAdSpotsAndOtherCounts } from "@/services/queries/getWebpageWithAdSpotsAndOtherCounts";

// type UseWebpageDetail = (websiteId: string, webpageId: string) => {webpage: }

const useWebpage = (wsid: string, wpid: string) => {
  const {
    data: webpage,
    error,
    isLoading,
    mutate,
  } = useSWR<WebpageWithAdSpotsAndOtherCounts>(
    wsid && wpid ? `/api/websites/${wsid}/webpages/${wpid}` : null,
    fetcher
  );

  return { webpage, error, isLoading };
};

export default useWebpage;
