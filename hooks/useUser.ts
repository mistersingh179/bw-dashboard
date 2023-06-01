import useTxToast from "@/hooks/useTxToast";
import useSWR from "swr";
import { MyErrorType, WebsiteType } from "@/types/my-types";
import fetcher from "@/helpers/fetcher";
import superjson from "superjson";
import { User } from ".prisma/client";

const useUser = () => {
  const {
    data: user,
    error,
    isLoading,
  } = useSWR<User>("/api/user", fetcher);

  return { user, error, isLoading };
};

export default useUser;
