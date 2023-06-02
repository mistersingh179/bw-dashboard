import useTxToast from "@/hooks/useTxToast";
import useSWR from "swr";
import { WebpageType } from "@/types/my-types";
import fetcher from "@/helpers/fetcher";
import React from "react";
import superjson from "superjson";

const useWebpages = (wsid: string, page: number, pageSize: number) => {
  const { success, failure } = useTxToast();

  const {
    data: webpages,
    error,
    isLoading,
    mutate,
  } = useSWR<WebpageType[]>(
    wsid
      ? `/api/websites/${wsid}/webpages?page=${page}&pageSize=${pageSize}`
      : null,
    fetcher
  );

  const onUpdate = async (
    updatedWebpage: WebpageType,
  ) => {
    if (webpages) {
      const idx = webpages.findIndex((x) => x.id === updatedWebpage.id);
      const newWebpages: WebpageType[] = [
        ...webpages.slice(0, idx),
        { ...updatedWebpage },
        ...webpages.slice(idx + 1),
      ];
      try {
        await mutate(newWebpages, {
          populateCache: true,
          revalidate: false,
        });
        success("Webpage", "Updated successfully");
        await mutate(updateWebpage.bind(this, updatedWebpage), {
          revalidate: true,
          populateCache: false,
        });
      } catch (err) {
        console.log("error updating webpage: ", err);
        failure("Webpage", "rolling back as update failed");
      }
    }
  };

  const onSave = async (newWebpage: WebpageType) => {
    console.log("going to save the website url: ", newWebpage);
    if(webpages){
      const newWebpages: WebpageType[] = [
        ...webpages,
        {...newWebpage}
      ]
      try{
        await mutate(newWebpages,{
          populateCache: true,
          revalidate: false,
        })
        success("Webpage", "Created successfully");
        await mutate(saveWebpage.bind(this, newWebpage), {
          populateCache: false,
          revalidate: true,
        })
      }catch(err){
        console.log("error while saving webpage");
        failure("Webpage", "rolling back as creation failed");
      }
    }
  };

  const updateWebpage = async (updatedWebpage: WebpageType) => {
    const res = await fetch(
      `/api/websites/${wsid}/webpages/${updatedWebpage.id}`,
      {
        method: "PUT",
        body: JSON.stringify(updatedWebpage),
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    console.log("res result: ", res.status);
    const text = await res.text();
    const data = await superjson.parse<any>(text);
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
    const text = await res.text();
    const data = await superjson.parse<any>(text);
    if (res.status >= 400) {
      throw new Error(data.message);
    } else {
      console.log("got new website url: ", data);
      return data;
    }
  };

  return { webpages, error, isLoading, onSave, onUpdate };
};

export default useWebpages;
