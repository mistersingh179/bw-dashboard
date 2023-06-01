import useSWR from "swr";
import useTxToast from "@/hooks/useTxToast";
import fetcher from "@/helpers/fetcher";
import { SettingType } from "@/types/my-types";
import React from "react";
import superjson from "superjson";

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
    const text = await res.text();
    const data = superjson.parse<any>(text);
    if (res.status >= 400) {
      throw new Error(data.message);
    } else {
      console.log("got updated settings: ", data);
      return data;
    }
  };

  const onSave = async (
    updatedSettings: SettingType,
  ) => {
    try {
      const newSettings = {...updatedSettings};
      await mutate(newSettings, {
        revalidate: false,
        populateCache: true,
      })
      success("Settings", "Updated successfully");
      await mutate(updateSettings.bind(this, newSettings), {
        revalidate: true,
        populateCache: false,
      });
    } catch (err) {
      console.log("failed to save settings: ", err);
      failure("Settings", "rolling back as update failed");
    }
  };

  return { settings, error, isLoading, onSave };
};

export default useSettings;
