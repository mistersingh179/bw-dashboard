import React from "react";
import {
  Box,
  Button,
  Heading,
  HStack,
  Spacer,
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
import { format } from "date-fns";
import fetcher from "@/helpers/fetcher";
import { useRouter } from "next/router";
import { AddIcon } from "@chakra-ui/icons";
import { CampaignType } from "@/types/my-types";
import StatusBadge from "@/components/StatusBadge";
import {
  ErrorRow,
  LoadingDataRow,
  NoDataRow,
} from "@/components/genericMessages";

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
    const result = await mutate(
      "/api/campaigns",
      deleteCampaign.bind(this, cid),
      {
        optimisticData: (currentData: CampaignType[]) => {
          return currentData.filter((x) => x.id != cid);
        },
        populateCache: false,
      }
    );
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
            {error && <ErrorRow colSpan={5} />}
            {isLoading && <LoadingDataRow colSpan={5} />}
            {data && data.length == 0 && <NoDataRow colSpan={5} />}
            {data &&
              data.length > 0 &&
              data.map((campaign) => (
                <Tr key={campaign.id ?? JSON.stringify(campaign)}>
                  <Td>{campaign.name}</Td>
                  <Td>{format(campaign.start, "MM/dd/yyyy")}</Td>
                  <Td>{format(campaign.end, "MM/dd/yyyy")}</Td>
                  <Td>
                    <StatusBadge status={campaign.status} />
                  </Td>
                  <Td>
                    <HStack spacing={5}>
                      <Button
                        isDisabled={campaign.id ? false : true}
                        size={"sm"}
                        onClick={deleteHandler.bind(
                          this,
                          campaign.id as string
                        )}
                      >
                        Delete
                      </Button>
                      <Link href={`/campaigns/${campaign.id}/show`}>
                        Details
                      </Link>
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
