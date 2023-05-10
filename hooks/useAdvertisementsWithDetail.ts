import useSWR from "swr";
import {WebpageWithDetailType} from "@/types/my-types";
import fetcher from "@/helpers/fetcher";
import {AdvertisementWithDetail} from "@/services/queries/getAdvertisementsForWebpage";

const useAdvertisementsWithDetail = (wsid: string, wpid: string) => {

  const {
    data: advertisements,
    error,
    isLoading,
    mutate,
  } = useSWR<AdvertisementWithDetail[]>(`/api/websites/${wsid}/webpages/${wpid}/advertisements`, fetcher);

  return {advertisements, error, isLoading};
}

export default useAdvertisementsWithDetail;