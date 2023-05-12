import useTxToast from "@/hooks/useTxToast";
import useSWR from "swr";
import { WebpageType } from "@/types/my-types";
import fetcher from "@/helpers/fetcher";
import React from "react";
import superjson from "superjson";
import { Category } from ".prisma/client";

const useCategoriesOfWebpage = (wsid: string, wpid: string) => {
  const {
    data: categories,
    error,
    isLoading,
    mutate,
  } = useSWR<Category[]>(
    wsid && wpid ? `/api/websites/${wsid}/webpages/${wpid}/categories` : null,
    fetcher
  );

  return { categories, error, isLoading };
};

export default useCategoriesOfWebpage;
