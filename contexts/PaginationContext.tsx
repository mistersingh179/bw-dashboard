import {createContext, Dispatch, ReactNode, SetStateAction, useState} from "react";

export type PaginationContentType = {
  page: number,
  setPage: Dispatch<SetStateAction<number>>,
  pageSize: number,
  setPageSize: Dispatch<SetStateAction<number>>
}

const PaginationContext = createContext<PaginationContentType | null>(null);

export default PaginationContext;

export const PaginationProvider = ({ children }: { children: ReactNode }) => {
  const [page, setPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);

  return (
    <PaginationContext.Provider
      value={{
        page,
        setPage,
        pageSize,
        setPageSize,
      }}
    >
      {children}
    </PaginationContext.Provider>
  );
};
