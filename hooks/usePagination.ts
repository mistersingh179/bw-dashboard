import {Dispatch, SetStateAction, useState} from "react";

export type PaginationType = {
  page: number;
  setPage: Dispatch<SetStateAction<number>>;
  pageSize: number;
  setPageSize: Dispatch<SetStateAction<number>>;
};

const usePagination = (
  defaultPageNumber: number = 1,
  defaultPageSize: number = 10
): PaginationType => {
  const [page, setPage] = useState(defaultPageNumber);
  const [pageSize, setPageSize] = useState(defaultPageSize);

  return { page, setPage, pageSize, setPageSize };
};

export default usePagination;
