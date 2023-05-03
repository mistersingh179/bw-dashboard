import useTxToast from "@/hooks/useTxToast";
import useSWR from "swr";
import {WebpageType} from "@/types/my-types";
import fetcher from "@/helpers/fetcher";
import React from "react";

const useWebpages = (wsid: string) => {
  const { success, failure } = useTxToast();

  const {
    data: webpages,
    error,
    isLoading,
    mutate,
  } = useSWR<WebpageType[]>(`/api/websites/${wsid}/webpages`, fetcher);

  const onUpdate = async (
    updatedWebpage: WebpageType,
    evt: React.ChangeEvent<HTMLInputElement>
  ) => {
    const updatedItem = { ...updatedWebpage };
    updatedItem.status = evt.target.checked;
    console.log("updated website url is: ", updatedItem);
    try {
      await mutate(updateWebpage.bind(this, updatedItem), {
        optimisticData: (currentData) => {
          console.log("in optimisticData with: ", currentData);
          success("Webpage", "Updated successfully");
          if (currentData) {
            const idx = currentData.findIndex((x) => x.id === updatedItem.id);
            return [
              ...currentData.slice(0, idx),
              { ...updatedItem },
              ...currentData.slice(idx + 1),
            ];
          } else {
            return [{ ...updatedItem }];
          }
        },
        populateCache: false,
      });
    } catch (err) {
      console.log("error updating webpage:", err);
      failure("Webpage", "rolling back as update failed");
    }
  };

  const onSave = async (newWebpage: WebpageType) => {
    console.log("going to save the website url: ", newWebpage);
    try {
      await mutate(saveWebpage.bind(this, newWebpage), {
        optimisticData: (currentData) => {
          success("Webpage", "Created successfully");
          if (currentData) {
            return [...currentData, { ...newWebpage }];
          } else {
            return [{ ...newWebpage }];
          }
        },
        populateCache: false,
      });
    } catch (err) {
      console.log("website url creation failed: ", err);
      failure("Webpage", "Rolling back as creation failed!");
    }
  };

  const updateWebpage = async (updatedWebpage: WebpageType) => {
    const res = await fetch(`/api/websites/${wsid}/webpages/${updatedWebpage.id}`, {
      method: "PUT",
      body: JSON.stringify(updatedWebpage),
      headers: {
        "Content-Type": "application/json",
      },
    });
    console.log("res result: ", res.status);
    const data = await res.json();
    if (res.status >= 400) {
      throw new Error(data.message);
    } else {
      console.log("got updated website url: ", data);
      return data;
    }
  };

  const saveWebpage = async (newWebpage: WebpageType) => {
    const res = await fetch(`/api/websites/${wsid}/webpages`, {
      method: "POST",
      body: JSON.stringify(newWebpage),
      headers: {
        "Content-Type": "application/json",
      },
    });
    console.log("res result: ", res.status);
    const data = await res.json();
    if (res.status >= 400) {
      throw new Error(data.message);
    } else {
      console.log("got new website url: ", data);
      return data;
    }
  };

  return { webpages, error, isLoading, onSave, onUpdate };
}

export default useWebpages;