import useSWR from "swr";
import useTxToast from "@/hooks/useTxToast";
import fetcher from "@/helpers/fetcher";
import { SettingType, WebpageType, WebsiteType } from "@/types/my-types";
import React from "react";

const useSettings = () => {
  const { success, failure } = useTxToast();
  const {
    data: settings,
    error,
    isLoading,
    mutate,
  } = useSWR<SettingType>("/api/settings", fetcher);

  const updateSettings = async (updatedSettings: SettingType) => {
    const res = await fetch(`/api/settings`, {
      method: "PUT",
      body: JSON.stringify(updatedSettings),
      headers: {
        "Content-Type": "application/json",
      },
    });
    console.log("res result: ", res.status);
    const data = await res.json();
    if (res.status >= 400) {
      throw new Error(data.message);
    } else {
      console.log("got updated settings: ", data);
      return data;
    }
  };

  const onSave = async (
    updatedSettings: SettingType,
    evt: React.MouseEvent<HTMLButtonElement>
  ) => {
    try {
      success("Settings", "Updated successfully");
      await mutate(updateSettings.bind(this, updatedSettings), {
        optimisticData: updatedSettings,
        populateCache: false,
      });
    } catch (err) {
      console.log("failed to save settings");
      failure("Settings", "Unable to save settings");
    }
  };

  return { settings, error, isLoading, onSave };
};

export default useSettings;
