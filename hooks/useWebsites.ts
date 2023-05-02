import useTxToast from "@/hooks/useTxToast";
import useSWR from "swr";
import { WebsiteType } from "@/types/my-types";
import fetcher from "@/helpers/fetcher";

const useWebsites = () => {
  const { success, failure } = useTxToast();
  const {
    data: websites,
    error,
    isLoading,
    mutate,
  } = useSWR<WebsiteType[]>("/api/websites", fetcher);

  const updateWebsite = async (updatedWebsite: WebsiteType) => {
    const res = await fetch(`/api/websites/${updatedWebsite.id}`, {
      method: "PUT",
      body: JSON.stringify(updatedWebsite),
      headers: {
        "Content-Type": "application/json",
      },
    });
    console.log("res result: ", res.status);
    const data = await res.json();
    if (res.status >= 400) {
      throw new Error(data.message);
    } else {
      console.log("got new website: ", data);
      return data;
    }
  };

  const createWebsite = async (newWebsite: WebsiteType) => {
    const res = await fetch("/api/websites/", {
      method: "POST",
      body: JSON.stringify(newWebsite),
      headers: {
        "Content-Type": "application/json",
      },
    });
    console.log("res result: ", res.status);
    const data = await res.json();
    if (res.status >= 400) {
      throw new Error(data.message);
    } else {
      console.log("got new website: ", data);
      return data;
    }
  };

  const onSave = async (newWebsite: WebsiteType) => {
    try {
      await mutate(createWebsite.bind(this, newWebsite), {
        optimisticData: (currentData) => {
          success("Website", "Created successfully");
          if (currentData) {
            return [...currentData, { ...newWebsite }];
          } else {
            return [{ ...newWebsite }];
          }
        },
        populateCache: false,
      });
    } catch (e) {
      console.log("saving website failed");
      failure("Website", "Rolling back as saving failed");
    }
  };

  const onUpdate = async (updatedWebsite: WebsiteType) => {
    try {
      await mutate(updateWebsite.bind(this, updatedWebsite), {
        optimisticData: (currentData) => {
          success("Website", "Updated successfully");
          if (currentData) {
            const idx = currentData.findIndex(
              (x) => x.id === updatedWebsite.id
            );
            return [
              ...currentData.slice(0, idx),
              { ...updatedWebsite },
              ...currentData.slice(idx + 1),
            ];
          } else {
            return [{ ...updatedWebsite }];
          }
        },
        populateCache: false,
      });
    } catch (e) {
      console.log("updating website failed");
      failure("Website", "Rolling back as update failed");
    }
  };

  return { websites, error, isLoading, onSave, onUpdate };
};

export default useWebsites;