import useTxToast from "@/hooks/useTxToast";
import useSWR from "swr";
import fetcher from "@/helpers/fetcher";
import superjson from "superjson";
import { CategoryWithCounts } from "@/pages/api/categories";

const useCategories = () => {
  const { success, failure } = useTxToast();

  const {
    data: categories,
    error,
    isLoading,
    mutate,
  } = useSWR<CategoryWithCounts[]>(`/api/categories`, fetcher);

  const onUpdate = async (updatedCategory: CategoryWithCounts) => {
    if (categories) {
      const idx = categories.findIndex((x) => x.id === updatedCategory.id);
      const newCategories: CategoryWithCounts[] = [
        ...categories.slice(0, idx),
        { ...updatedCategory },
        ...categories.slice(idx + 1),
      ];
      try {
        await mutate(newCategories, {
          populateCache: true,
          revalidate: false,
        });
        success("Category", "Updated successfully");
        await mutate(updateCategory.bind(this, updatedCategory), {
          revalidate: true,
          populateCache: false,
        });
      } catch (err) {
        console.log("error updating webpage: ", err);
        failure("Category", "rolling back as update failed");
      }
    }
  };

  const updateCategory = async (updatedCategory: CategoryWithCounts) => {
    const res = await fetch(`/api/categories/${updatedCategory.id}`, {
      method: "PUT",
      body: JSON.stringify(updatedCategory),
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
      console.log("got updated website url: ", data);
      return data;
    }
  };

  return { categories, error, isLoading, onUpdate };
};

export default useCategories;
