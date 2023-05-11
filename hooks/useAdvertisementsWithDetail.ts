import useSWR from "swr";
import fetcher from "@/helpers/fetcher";
import { AdvertisementWithDetail } from "@/services/queries/getAdvertisementsForWebpage";

const useAdvertisementsWithDetail = (wsid: string, wpid: string) => {
  const {
    data: advertisements,
    error,
    isLoading,
    mutate,
  } = useSWR<AdvertisementWithDetail[]>(
    wsid && wpid
      ? `/api/websites/${wsid}/webpages/${wpid}/advertisements`
      : null,
    fetcher
  );

  return { advertisements, error, isLoading };
};

export default useAdvertisementsWithDetail;
