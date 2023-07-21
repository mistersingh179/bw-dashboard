import useTxToast from "@/hooks/useTxToast";
import useSWR from "swr";
import { CampaignType } from "@/types/my-types";
import fetcher from "@/helpers/fetcher";
import superjson from "superjson";

const useCampaigns = (page: number, pageSize: number) => {
  const { success, failure } = useTxToast();

  const {
    data: campaigns,
    error,
    isLoading,
    mutate,
  } = useSWR<CampaignType[]>(
    `/api/campaigns?page=${page}&pageSize=${pageSize}`,
    fetcher
  );

  const onDelete = async (deletedCampaign: CampaignType) => {
    if (campaigns) {
      const idx = campaigns.findIndex((x) => x.id === deletedCampaign.id);
      const newCampaigns: CampaignType[] = [
        ...campaigns.slice(0, idx),
        ...campaigns.slice(idx + 1),
      ];
      try {
        await mutate(newCampaigns, {
          populateCache: true,
          revalidate: false,
        });
        success("Campaign", "Deleted successfully");
        await mutate(deleteCampaign.bind(this, deletedCampaign), {
          revalidate: true,
          populateCache: false,
        });
      } catch (err) {
        console.log("error updating webpage: ", err);
        failure("Campaign", "rolling back as update failed");
      }
    }
  }

  const onUpdate = async (updatedCampaign: CampaignType) => {
    if (campaigns) {
      const idx = campaigns.findIndex((x) => x.id === updatedCampaign.id);
      const newCampaigns: CampaignType[] = [
        ...campaigns.slice(0, idx),
        { ...updatedCampaign },
        ...campaigns.slice(idx + 1),
      ];
      try {
        await mutate(newCampaigns, {
          populateCache: true,
          revalidate: false,
        });
        success("Campaign", "Updated successfully");
        await mutate(updateCampaign.bind(this, updatedCampaign), {
          revalidate: true,
          populateCache: false,
        });
      } catch (err) {
        console.log("error updating webpage: ", err);
        failure("Campaign", "rolling back as update failed");
      }
    }
  };

  const onSave = async (newCampaign: CampaignType) => {
    console.log("going to save campaign: ", newCampaign);
    if (campaigns) {
      const newCampaigns: CampaignType[] = [...campaigns, { ...newCampaign }];
      try {
        await mutate(newCampaigns, {
          populateCache: true,
          revalidate: false,
        });
        success("Campaign", "Created successfully");
        await mutate(saveCampaign.bind(this, newCampaign), {
          populateCache: false,
          revalidate: true,
        });
      } catch (err) {
        console.log("error while saving webpage");
        failure("Campaign", "rolling back as creation failed");
      }
    }
  };

  const deleteCampaign = async (deletedCampaign: CampaignType) => {
    const res = await fetch(`/api/campaigns/${deletedCampaign.id}`, {
      method: "DELETE",
    });
    console.log("res result: ", res.status);
    const text = await res.text();
    if (res.status >= 400) {
      throw new Error(text);
    } else {
      console.log("campaign has been deleted: ", text);
    }
    return undefined
  }

  const updateCampaign = async (updatedCampaign: CampaignType) => {
    const res = await fetch(`/api/campaigns/${updatedCampaign.id}`, {
      method: "PUT",
      body: JSON.stringify(updatedCampaign),
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
      console.log("got updated campaign url: ", data);
      return data;
    }
  };

  const saveCampaign = async (newCampaign: CampaignType) => {
    const res = await fetch(`/api/campaigns/`, {
      method: "POST",
      body: JSON.stringify(newCampaign),
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
      console.log("got new campaign url: ", data);
      return data;
    }
  };

  return { campaigns, error, isLoading, onSave, onUpdate, onDelete };
};

export default useCampaigns;
