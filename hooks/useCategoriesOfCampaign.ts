import useTxToast from "@/hooks/useTxToast";
import useSWR, { mutate } from "swr";
import { CategoryType, WebpageType } from "@/types/my-types";
import fetcher from "@/helpers/fetcher";
import React from "react";
import superjson from "superjson";
import { Category } from ".prisma/client";
import { CategoryOptionType } from "@/components/CampaignForm";
import { ActionMeta, MultiValue } from "chakra-react-select";
import useCategories from "@/hooks/useCategories";
import { Campaign } from "@prisma/client";

export const setCategoriesOnCampaign = async (cid: string, categoryIds: string[]) => {
  const res = await fetch(`/api/campaigns/${cid}/categories`, {
    method: "POST",
    body: JSON.stringify({ categories: categoryIds }),
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
    console.log("got new categories ", data);
    return data;
  }
};

const useCategoriesOfCampaign = (cid: string | undefined) => {
  const { success, failure } = useTxToast();
  const { categories: allCategories } = useCategories();

  type CategoriesNameToIdHash = { [key: string]: string };

  const categoriesNameToId: CategoriesNameToIdHash | undefined =
    allCategories?.reduce(
      (previousValue: CategoriesNameToIdHash, currentValue) => {
        previousValue[currentValue.name] = currentValue.id;
        return previousValue;
      },
      {}
    );

  const {
    data: categories,
    error,
    isLoading,
    mutate,
  } = useSWR<CategoryType[]>(
    cid ? `/api/campaigns/${cid}/categories` : null,
    fetcher
  );

  const onSave = async (categoryIds: string[]) => {
    try {
      success("Campaign Categories", "Successfully Saved Campaign Categories");
      await mutate(setCategoriesOnCampaign.bind(this, cid as string, categoryIds), {
        populateCache: false,
      });
    } catch (err) {
      console.log("campaign categories save failed: ", err);
      failure("Campaign Categories", "Rolling back as saving failed!");
    }
  };

  return { categories, error, isLoading, onSave };
};

export default useCategoriesOfCampaign;
