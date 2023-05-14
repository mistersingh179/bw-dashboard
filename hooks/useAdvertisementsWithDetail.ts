import useSWR from "swr";
import fetcher from "@/helpers/fetcher";
import { AdvertisementWithDetail } from "@/services/queries/getAdvertisementsForWebpage";
import superjson from "superjson";
import { Advertisement } from "@prisma/client";
import useTxToast from "@/hooks/useTxToast";

const useAdvertisementsWithDetail = (wsid: string, wpid: string) => {
  const { success, failure } = useTxToast();
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

  const updateAdvertisement = async (
    newAdvertisement: AdvertisementWithDetail
  ) => {
    const res = await fetch(
      `/api/websites/${wsid}/webpages/${wpid}/advertisements/${newAdvertisement.id}`,
      {
        method: "PUT",
        body: JSON.stringify(newAdvertisement),
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    console.log("res result: ", res.status);
    const text = await res.text();
    const data = superjson.parse<any>(text);
    if (res.status >= 400) {
      throw new Error(data.message);
    } else {
      console.log("got new website: ", data);
      return data;
    }
  };

  const onUpdate = async (updatedAdvertisement: AdvertisementWithDetail) => {
    if (advertisements) {
      const idx = advertisements.findIndex(
        (x) => x.id === updatedAdvertisement.id
      );
      const newAdvertisements: AdvertisementWithDetail[] = [
        ...advertisements.slice(0, idx),
        updatedAdvertisement,
        ...advertisements.slice(idx + 1),
      ];
      try {
        await mutate(newAdvertisements, {
          revalidate: false,
          populateCache: true,
        });
        success("Advertisement", "Updated successfully");
        await mutate(updateAdvertisement.bind(this, updatedAdvertisement), {
          revalidate: true,
          populateCache: false,
        });
      } catch (err) {
        failure("Webpage", "rolling back as update failed");
      }
    }
  };

  return { advertisements, error, isLoading, onUpdate };
};

export default useAdvertisementsWithDetail;
