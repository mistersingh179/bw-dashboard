import useTxToast from "@/hooks/useTxToast";
import useSWR from "swr";
import { WebpageType } from "@/types/my-types";
import fetcher from "@/helpers/fetcher";
import React from "react";
import superjson from "superjson";
import { Category } from ".prisma/client";
import { CategoryWithCounts } from "@/pages/api/categories";

const useCategories = () => {
  const {
    data: categories,
    error,
    isLoading,
    mutate,
  } = useSWR<CategoryWithCounts[]>(`/api/categories`, fetcher);

  return { categories, error, isLoading };
};

export default useCategories;
