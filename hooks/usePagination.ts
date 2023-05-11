import {useState} from "react";

const usePagination = () => {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  return {page, setPage, pageSize, setPageSize};
}

export default usePagination;