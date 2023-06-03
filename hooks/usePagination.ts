import { useState } from "react";

const usePagination = (
  defaultPageNumber: number = 1,
  defaultPageSize: number = 10
) => {
  const [page, setPage] = useState(defaultPageNumber);
  const [pageSize, setPageSize] = useState(defaultPageSize);

  return { page, setPage, pageSize, setPageSize };
};

export default usePagination;
