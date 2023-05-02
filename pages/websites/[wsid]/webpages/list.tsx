import FCWithAuth from "@/types/FCWithAuth";
import {
  Box,
  Button,
  Heading,
  HStack,
  Spacer,
  Switch,
  Table,
  TableCaption,
  TableContainer,
  Tbody,
  Td,
  Th,
  Thead,
  Tr,
  useDisclosure,
} from "@chakra-ui/react";
import { AddIcon } from "@chakra-ui/icons";
import React from "react";
import { ErrorRow, LoadingDataRow, NoDataRow } from "@/components/genericRows";
import useSWR from "swr";
import fetcher from "@/helpers/fetcher";
import CreateWebpageModal from "@/components/modals/CreateWebpageModal";
import { WebpageType } from "@/types/my-types";
import useTxToast from "@/hooks/useTxToast";
import { QueryParams } from "@/types/QueryParams";
import { useRouter } from "next/router";

import useWebpages from "@/hooks/useWebpages";
import useWebsites from "@/hooks/useWebsites";
import Link from "next/link";

const Webpages: FCWithAuth = () => {
  const router = useRouter();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { wsid } = router.query as QueryParams;
  const { webpages, error, isLoading, onSave, onUpdate } = useWebpages(
    wsid as string
  );
  const { websites } = useWebsites();
  const website = (websites || []).find((ws) => ws.id === wsid);

  return (
    <Box>
      <CreateWebpageModal isOpen={isOpen} onClose={onClose} onSave={onSave} />
      <HStack alignItems={"baseline"} my={5}>
        <Heading>Webpages</Heading>
        <Heading color={"gray.400"} size={"sm"}>
          <Link href={"/websites/list"}> – {website?.topLevelDomainUrl} </Link>
        </Heading>
        <Spacer />
        <Button onClick={onOpen} colorScheme={"blue"} leftIcon={<AddIcon />}>
          Add another Webpage
        </Button>
      </HStack>
      <TableContainer>
        <Table variant="simple" colorScheme="gray" size={"md"}>
          <Thead>
            <Tr>
              <Th>Url</Th>
              <Th>Status</Th>
            </Tr>
          </Thead>
          <Tbody>
            {error && <ErrorRow colSpan={2} />}
            {isLoading && <LoadingDataRow colSpan={2} />}
            {webpages && webpages.length == 0 && <NoDataRow colSpan={2} />}
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
                </Tr>
              ))}
          </Tbody>
          {webpages && webpages.length > 0 && (
            <TableCaption>These are your sweet webpages.</TableCaption>
          )}
        </Table>
      </TableContainer>
    </Box>
  );
};

Webpages.auth = true;
export default Webpages;
