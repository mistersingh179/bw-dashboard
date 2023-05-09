import FCWithAuth from "@/types/FCWithAuth";
import {
  Box,
  Heading,
  HStack,
  Switch,
  Table,
  TableCaption,
  TableContainer,
  Tbody,
  Td,
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
import { QueryParams } from "@/types/QueryParams";
import { useRouter } from "next/router";

import useAdvertisementsWithDetail from "@/hooks/useAdvertisementsWithDetail";
import Link from "next/link";
import { AdvertisementWithDetail } from "@/services/queries/getAdvertisementsForWebpage";
import useWebpage from "@/hooks/useWepage";

const Advertisements: FCWithAuth = () => {
  const router = useRouter();
  const { wsid, wpid } = router.query as QueryParams;
  const { advertisements, error, isLoading } = useAdvertisementsWithDetail(
    wsid,
    wpid
  );
  const {
    webpage,
    isLoading: isLoadingWp,
    error: errorWp,
  } = useWebpage(wsid, wpid);

  return (
    <Box>
      <HStack alignItems={"baseline"} my={5}>
        <Heading>Advertisements</Heading>
        {webpage && (
          <Heading color={"gray.400"} size={"sm"}>
            <Link href={`/websites/${wsid}/webpages/${wpid}/show`}>
              {" "}
              – {webpage.url}{" "}
            </Link>
          </Heading>
        )}
      </HStack>
      <TableContainer whiteSpace={"normal"}>
        <Table variant="simple" colorScheme="gray" size={"sm"}>
          <Thead>
            <Tr>
              <Th>Name</Th>
              <Th>Dates</Th>
              <Th>Score</Th>
              <Th>Reason</Th>
              <Th>Product Name</Th>
              <Th>Product Description</Th>
              <Th>Before</Th>
              <Th>Advertisement</Th>
              <Th>After</Th>
              <Th>Status</Th>
            </Tr>
          </Thead>
          <Tbody>
            {error && <ErrorRow colSpan={10} />}
            {isLoading && <LoadingDataRow colSpan={10} />}
            {advertisements && advertisements.length == 0 && (
              <NoDataRow colSpan={10} />
            )}
            {advertisements &&
              advertisements.length > 0 &&
              advertisements.map((advertisement: AdvertisementWithDetail) => (
                <Tr key={advertisement.id}>
                  <Td>{advertisement.scoredCampaign.campaign.name}</Td>
                  <Td>
                    {advertisement.scoredCampaign.campaign.start.toString()}{" "}
                    <br />
                    {advertisement.scoredCampaign.campaign.start.toString()}
                  </Td>
                  <Td>{advertisement.scoredCampaign.score}</Td>
                  <Td>{advertisement.scoredCampaign.reason}</Td>
                  <Td>{advertisement.scoredCampaign.campaign.productName}</Td>
                  <Td>
                    {advertisement.scoredCampaign.campaign.productDescription}
                  </Td>
                  <Td>{advertisement.advertisementSpot.beforeText}</Td>
                  <Td>{advertisement.advertText}</Td>
                  <Td>{advertisement.advertisementSpot.afterText}</Td>
                  <Td>
                    <Switch isChecked={advertisement.status} />
                  </Td>
                </Tr>
              ))}
          </Tbody>
          {advertisements && advertisements.length > 0 && (
            <TableCaption>These are your sweet webpages.</TableCaption>
          )}
        </Table>
      </TableContainer>
    </Box>
  );
};

Advertisements.auth = true;
export default Advertisements;
