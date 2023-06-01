import useTxToast from "@/hooks/useTxToast";
import useSWR from "swr";
import { MyErrorType, WebsiteType } from "@/types/my-types";
import fetcher from "@/helpers/fetcher";
import superjson from "superjson";
import { User } from ".prisma/client";

export type UserWithCounts = User & {
  _count: { campaigns: number; websites: number; categories: number };
};
const useUsers = () => {
  const {
    data: users,
    error,
    isLoading,
  } = useSWR<UserWithCounts[]>("/api/users", fetcher);

  return { users, error, isLoading };
};

export default useUsers;
