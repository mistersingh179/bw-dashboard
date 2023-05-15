import FCWithAuth from "@/types/FCWithAuth";
import {
  Box,
  Heading,
  HStack,
  Spacer,
  Switch,
  Table,
  TableCaption,
  TableContainer,
  Tbody,
  Td,
  Tfoot,
  Th,
  Thead,
  Tr,
} from "@chakra-ui/react";
import React from "react";
import {
  ErrorRow,
  LoadingDataRow,
  NoDataRow,
} from "@/components/genericMessages";
import { preload } from "swr";
import fetcher from "@/helpers/fetcher";
import { WebpageType } from "@/types/my-types";
import { QueryParams } from "@/types/QueryParams";
import { useRouter } from "next/router";

import useWebpages from "@/hooks/useWebpages";
import useWebsites from "@/hooks/useWebsites";
import Link from "next/link";
import PaginationRow from "@/components/PaginationRow";
import usePagination from "@/hooks/usePagination";

const Webpages: FCWithAuth = () => {
  const router = useRouter();
  const { wsid } = router.query as QueryParams;

  const { page, setPage, pageSize, setPageSize } = usePagination();

  const { webpages, error, isLoading, onSave, onUpdate } = useWebpages(
    wsid,
    page,
    pageSize
  );

  const { websites } = useWebsites();
  const website = (websites || []).find((ws) => ws.id === wsid);

  return (
    <Box>
      <HStack alignItems={"baseline"} my={5}>
        <Heading>Webpages</Heading>
        <Heading color={"gray.400"} size={"sm"}>
          <Link href={"/websites/list"}> – {website?.topLevelDomainUrl} </Link>
        </Heading>
        <Spacer />
      </HStack>
      <TableContainer whiteSpace={"normal"}>
        <Table variant={"simple"} size={"md"}>
          <Thead>
            <Tr>
              <Th>Url</Th>
              <Th>Status</Th>
              <Th>Actions</Th>
            </Tr>
          </Thead>
          <Tbody>
            {error && <ErrorRow colSpan={3} />}
            {isLoading && <LoadingDataRow colSpan={3} height={"lg"} />}
            {!isLoading && webpages && webpages.length == 0 && (
              <NoDataRow colSpan={3} />
            )}
            {webpages &&
              webpages.length > 0 &&
              webpages.map((webpage: WebpageType) => (
                <Tr key={webpage.id ?? JSON.stringify(webpage)}>
                  <Td>{webpage.url}</Td>
                  <Td>
                    <Switch
                      isChecked={webpage.status}
                      isDisabled={webpage.id ? false : true}
                      onChange={onUpdate.bind(this, webpage)}
                    />
                  </Td>
                  <Td>
                    <Link
                      href={`/websites/${wsid}/webpages/${webpage.id}/show`}
                      onMouseEnter={() =>
                        preload(
                          `/api/websites/${wsid}/webpages/${webpage.id}`,
                          fetcher
                        )
                      }
                    >
                      Details
                    </Link>
                  </Td>
                </Tr>
              ))}
          </Tbody>
          {webpages && webpages.length > 0 && (
            <TableCaption>These are your sweet webpages.</TableCaption>
          )}
          <Tfoot>
            <PaginationRow
              page={page}
              setPage={setPage}
              pageSize={pageSize}
              setPageSize={setPageSize}
              colSpan={3}
              onMouseOverFn={() =>
                preload(
                  `/api/websites/${wsid}/webpages?page=${
                    page + 1
                  }&pageSize=${pageSize}`,
                  fetcher
                )
              }
            />
          </Tfoot>
        </Table>
      </TableContainer>
    </Box>
  );
};

Webpages.auth = true;
export default Webpages;
