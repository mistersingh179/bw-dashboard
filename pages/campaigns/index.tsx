import React from "react";
import { useSession } from "next-auth/react";
import {
  Alert,
  AlertIcon,
  Box,
  Button,
  Heading,
  HStack,
  Skeleton,
  SkeletonText,
  Spacer,
  Spinner,
  Stack,
  Table,
  TableCaption,
  TableContainer,
  Tbody,
  Td,
  Text,
  Tfoot,
  Th,
  Thead,
  Tr,
  VStack,
} from "@chakra-ui/react";
import Settings from "@/pages/settings";
import FCWithAuth from "@/types/FCWithAuth";
import { Link, Image } from "@chakra-ui/next-js";
import NewCampaign from "@/pages/campaigns/new";
import useSWR, { mutate } from "swr";
import { Campaign as CampaignPrismaType } from "@prisma/client";
import { format, parseISO } from "date-fns";
import fetcher from "@/helpers/fetcher";
import { useRouter } from "next/router";
import { AddIcon } from "@chakra-ui/icons";

type CampaignWithOptimisticValue = CampaignPrismaType & {
  optimisticValue: boolean;
};

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
  const { data, error, isLoading } = useSWR<CampaignWithOptimisticValue[]>(
    "/api/campaigns",
    fetcher
  );
  console.log(isLoading, data);
  const deleteCampaign = async (cid: string) => {
    const res = await fetch(`/api/campaigns/${cid}`, {
      method: "DELETE",
    });
  };
  const deleteHandler = async (cid: string) => {
    const result = mutate("/api/campaigns", deleteCampaign.bind(this, cid), {
      optimisticData: (currentData: CampaignWithOptimisticValue[]) => {
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
              <Th>Actions</Th>
            </Tr>
          </Thead>
          <Tbody>
            {error && <ErrorRow />}
            {isLoading && <LoadingDataRow />}
            {data && data.length == 0 && <NoDataRow />}
            {data &&
              data.length > 0 &&
              data.map((x) => (
                <Tr key={x.id ?? JSON.stringify(x)}>
                  <Td>{x.name}</Td>
                  <Td>{format(parseISO(x.start.toString()), "MM/dd/yyyy")}</Td>
                  <Td>{format(parseISO(x.end.toString()), "MM/dd/yyyy")}</Td>
                  <Td>
                    <HStack spacing={5}>
                      <Button
                        isDisabled={!!x.optimisticValue}
                        size={"sm"}
                        onClick={deleteHandler.bind(this, x.id)}
                      >
                        Delete
                      </Button>
                      <Link href={`/campaigns/${x.id}`}>Details</Link>
                      <Link href={`/campaigns/${x.id}/edit`}>Edit</Link>
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
