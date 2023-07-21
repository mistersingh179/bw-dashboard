import React from "react";
import {
  Box,
  Button,
  Heading,
  HStack,
  Skeleton,
  Spacer,
  StackProps,
  Switch,
  Table,
  TableCaption,
  TableContainer,
  Tbody,
  Td,
  Th,
  Text,
  Thead,
  Tr,
} from "@chakra-ui/react";
import FCWithAuth from "@/types/FCWithAuth";
import { Link } from "@chakra-ui/next-js";
import { preload } from "swr";
import fetcher from "@/helpers/fetcher";
import { useRouter } from "next/router";
import { AddIcon } from "@chakra-ui/icons";
import {
  ErrorRow,
  LoadingDataRow,
  NoDataRow,
} from "@/components/genericMessages";
import useCampaigns from "@/hooks/useCampaigns";
import usePagination from "@/hooks/usePagination";
import useCampWithImpCount from "@/hooks/useCampWithImpCount";
import {
  ImpDeliveryMessage,
  InFlightMessage,
} from "@/pages/websites/[wsid]/webpages/[wpid]/show";
import { Campaign } from "@prisma/client";
import numeral from "numeral";

export const disabledProps: StackProps = {
  opacity: 0.4,
  pointerEvents: "none",
};

const Campaigns: FCWithAuth = () => {
  const router = useRouter();
  const { page, setPage, pageSize, setPageSize } = usePagination();
  const { campaigns, error, isLoading, onUpdate, onDelete } = useCampaigns(
    page,
    pageSize
  );
  const {
    campsWithImpCount,
    isLoading: isLoadingCampWithImpCount,
    error: errorCampWithImpCount,
  } = useCampWithImpCount();

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
      <TableContainer whiteSpace={"normal"}>
        <Table variant="simple" colorScheme="gray" size={"md"}>
          <Thead>
            <Tr>
              <Th>Name</Th>
              <Th>In-Flight</Th>
              <Th>Delivery</Th>
              <Th>Status</Th>
              <Th>Actions</Th>
            </Tr>
          </Thead>
          <Tbody>
            {error && <ErrorRow colSpan={5} />}
            {isLoading && <LoadingDataRow colSpan={5} />}
            {!isLoading && campaigns && campaigns.length == 0 && (
              <NoDataRow colSpan={5} />
            )}
            {campaigns &&
              campaigns.length > 0 &&
              campaigns.map((campaign) => (
                <Tr key={campaign.id ?? JSON.stringify(campaign)}>
                  <Td>
                    {campaign.name} / {campaign.id}
                  </Td>
                  <Td>
                    <InFlightMessage campaign={campaign as Campaign} />{" "}
                  </Td>
                  <Td>
                    <ImpDeliveryMessage
                      campaign={campaign as Campaign}
                      campsWithImpCount={campsWithImpCount}
                    />
                  </Td>
                  <Td>
                    <Switch
                      isChecked={campaign.status}
                      isDisabled={campaign.id ? false : true}
                      onChange={(evt) =>
                        onUpdate({ ...campaign, status: evt.target.checked })
                      }
                    />
                  </Td>
                  <Td>
                    {
                      <HStack
                        spacing={5}
                        {...(!campaign.id ? disabledProps : {})}
                      >
                        <Button
                          size={"sm"}
                          onClick={(evt) => onDelete({ ...campaign })}
                        >
                          Delete
                        </Button>
                        <Link
                          href={`/campaigns/${campaign.id}/show`}
                          onMouseEnter={() =>
                            preload(`/api/campaigns/${campaign.id}`, fetcher)
                          }
                        >
                          Details
                        </Link>
                        <Link href={`/campaigns/${campaign.id}/edit`}>
                          Edit
                        </Link>
                      </HStack>
                    }
                  </Td>
                </Tr>
              ))}
          </Tbody>
          {campaigns && campaigns.length > 0 && (
            <TableCaption>These are your sweet campaigns.</TableCaption>
          )}
        </Table>
      </TableContainer>
    </Box>
  );
};

Campaigns.auth = true;

export default Campaigns;
