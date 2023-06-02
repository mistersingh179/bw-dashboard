import useTxToast from "@/hooks/useTxToast";
import useSWR from "swr";
import {MyErrorType, WebsiteType} from "@/types/my-types";
import fetcher from "@/helpers/fetcher";
import superjson from "superjson";

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
    const text = await res.text();
    const data = superjson.parse<any>(text);
    if (res.status >= 400) {
      throw new Error(data.message);
    } else {
      console.log("got new website: ", data);
      return data;
    }
  };

  const createWebsite = async (newWebsite: WebsiteType) => {
    const res = await fetch("/api/websites", {
      method: "POST",
      body: JSON.stringify(newWebsite),
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
      console.log("saving website failed: ", e);
      failure("Website", "Rolling back as saving failed");
    }
  };

  const onUpdate = async (updatedWebsite: WebsiteType) => {
    if(websites){
      const idx = websites.findIndex(
        (x) => x.id === updatedWebsite.id
      );
      const newWebsites: WebsiteType[] = [
        ...websites.slice(0, idx),
        updatedWebsite,
        ...websites.slice(idx + 1),
      ];
      try{
        await mutate(newWebsites, {
          populateCache: true,
          revalidate: false,
        })
        success("Website", "Updated successfully");
        await mutate(updateWebsite.bind(this, updatedWebsite), {
          revalidate: true,
          populateCache: false,
        })
      }catch(err){
        console.log("error updating websites: ", err);
        failure("Website", "rolling back as update failed")
      }
    }
  };

  return { websites, error, isLoading, onSave, onUpdate };
};

export default useWebsites;