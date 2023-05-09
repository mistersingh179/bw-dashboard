import useSWR from "swr";
import {WebpageType, WebpageWithDetailType} from "@/types/my-types";
import fetcher from "@/helpers/fetcher";

// type UseWebpageDetail = (websiteId: string, webpageId: string) => {webpage: }

const useWebpage = (wsid: string, wpid: string) => {

  const {
    data: webpage,
    error,
    isLoading,
    mutate,
  } = useSWR<WebpageType>(`/api/websites/${wsid}/webpages/${wpid}`, fetcher);

  return {webpage, error, isLoading};
}

export default useWebpage;