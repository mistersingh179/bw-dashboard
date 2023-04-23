import React from "react";
import {
  Badge,
  Box,
  Button,
  Heading,
  HStack,
  Spacer,
  Spinner,
  Table,
  TableCaption,
  TableContainer,
  Tbody,
  Td,
  Th,
  Thead,
  Tr,
} from "@chakra-ui/react";
import FCWithAuth from "@/types/FCWithAuth";
import { Link } from "@chakra-ui/next-js";
import useSWR, { mutate } from "swr";
import { format, parseISO } from "date-fns";
import fetcher from "@/helpers/fetcher";
import { useRouter } from "next/router";
import { AddIcon } from "@chakra-ui/icons";
import { CampaignType } from "@/types/campaign-types";
import StatusBadge from "@/components/StatusBadge";

const ErrorRow = () => {
  return (
    <Tr>
      <Td colSpan={4} textAlign={"center"}>
        There was an error processing your request. Try again?
      </Td>
    </Tr>
  );
};

const NoDataRow = () => {
  return (
    <Tr>
      <Td colSpan={4} textAlign={"center"}>
        No campaigns yet, shall we <Link href={"/campaign"}>create</Link> one?
      </Td>
    </Tr>
  );
};

const LoadingDataRow = () => {
  return (
    <Tr>
      <Td colSpan={4} textAlign={"center"}>
        <Spinner color={"blue.500"} />
      </Td>
    </Tr>
  );
};

const Campaigns: FCWithAuth = () => {
  const router = useRouter();
  const { data, error, isLoading } = useSWR<CampaignType[]>(
    "/api/campaigns",
    fetcher
  );
  const deleteCampaign = async (cid: string) => {
    const res = await fetch(`/api/campaigns/${cid}`, {
      method: "DELETE",
    });
  };
  const deleteHandler = async (cid: string) => {
    const result = await mutate("/api/campaigns", deleteCampaign.bind(this, cid), {
      optimisticData: (currentData: CampaignType[]) => {
        return currentData.filter((x) => x.id != cid);
      },
      populateCache: false,
    });
    console.log("result of mutate call: ", result);
  };
  return (
    <Box>
      <HStack>
        <Heading my={5}>Campaigns</Heading>
        <Spacer />
        <Button
          onClick={() => router.push("/campaigns/new")}
          colorScheme={"blue"}
          leftIcon={<AddIcon />}
        >
          Create New Campaign
        </Button>
      </HStack>
      <TableContainer>
        <Table variant="simple" colorScheme="gray" size={"md"}>
          <Thead>
            <Tr>
              <Th>Name</Th>
              <Th>Start</Th>
              <Th>End</Th>
              <Th>Status</Th>
              <Th>Actions</Th>
            </Tr>
          </Thead>
          <Tbody>
            {error && <ErrorRow />}
            {isLoading && <LoadingDataRow />}
            {data && data.length == 0 && <NoDataRow />}
            {data &&
              data.length > 0 &&
              data.map((campaign) => (
                <Tr key={campaign.id ?? JSON.stringify(campaign)}>
                  <Td>{campaign.name}</Td>
                  <Td>
                    {format(parseISO(campaign.start.toString()), "MM/dd/yyyy")}
                  </Td>
                  <Td>
                    {format(parseISO(campaign.end.toString()), "MM/dd/yyyy")}
                  </Td>
                  <Td>
                    <StatusBadge status={campaign.status} />
                  </Td>
                  <Td>
                    <HStack spacing={5}>
                      <Button
                        isDisabled={!!campaign.optimisticValue}
                        size={"sm"}
                        onClick={deleteHandler.bind(
                          this,
                          campaign.id as string
                        )}
                      >
                        Delete
                      </Button>
                      <Link href={`/campaigns/${campaign.id}/show`}>Details</Link>
                      <Link href={`/campaigns/${campaign.id}/edit`}>Edit</Link>
                    </HStack>
                  </Td>
                </Tr>
              ))}
          </Tbody>
          {data && data.length > 0 && (
            <TableCaption>These are your sweet campaigns.</TableCaption>
          )}
        </Table>
      </TableContainer>
    </Box>
  );
};

Campaigns.auth = true;

export default Campaigns;
