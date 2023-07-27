import { createContext, ReactNode } from "react";
import usePagination, { PaginationType } from "@/hooks/usePagination";

export type PaginationContextType = {
  webpagesPagination: PaginationType;
  campaignsPagination: PaginationType;
};

const PaginationContext = createContext<PaginationContextType | null>(null);

export default PaginationContext;

export const PaginationProvider = ({ children }: { children: ReactNode }) => {
  const webpagesPagination = usePagination();
  const campaignsPagination = usePagination();

  return (
    <PaginationContext.Provider
      value={{
        webpagesPagination,
        campaignsPagination,
      }}
    >
      {children}
    </PaginationContext.Provider>
  );
};
