import { useRouter } from "next/router";
import { QueryParams } from "@/types/QueryParams";
import {
  Box,
  Button,
  Heading,
  HStack,
  Spacer,
  Spinner,
  Table,
  TableCaption,
  TableContainer,
  Tag,
  Tbody,
  Td,
  Text,
  Tfoot,
  Th,
  Thead,
  Tr,
  VStack,
} from "@chakra-ui/react";
import React from "react";
import useWebpage from "@/hooks/useWepage";
import {
  ErrorAlert,
  ErrorRow,
  LoadingDataRow,
  NoDataRow,
  WarningAlert,
} from "@/components/genericMessages";
import { formatISO } from "date-fns";
import StatusBadge from "@/components/StatusBadge";
import { Link } from "@chakra-ui/next-js";
import {ArrowForwardIcon, ExternalLinkIcon} from "@chakra-ui/icons";
import { preload } from "swr";
import fetcher from "@/helpers/fetcher";
import { WebpageWithAdSpotsAndOtherCounts } from "@/services/queries/getWebpageWithAdSpotsAndOtherCounts";
import useCategoriesOfWebpage from "@/hooks/useCategoriesOfWebpage";
import useScoredCampaignsOfWebpage from "@/hooks/useScoredCampaignsOfWebpage";
import usePagination from "@/hooks/usePagination";
import PaginationRow from "@/components/PaginationRow";
import { ScoredCampaignWithCampaign } from "@/pages/api/websites/[wsid]/webpages/[wpid]/scoredCampaigns";

const ScoredCampaigns = () => {
  const router = useRouter();
  const { wsid, wpid } = router.query as QueryParams;
  const { page, setPage, pageSize, setPageSize } = usePagination(1, 5);
  const { scoredCampaigns, isLoading, error } = useScoredCampaignsOfWebpage(
    wsid,
    wpid,
    page,
    pageSize
  );

  return (
    <>
      <TableContainer whiteSpace={"normal"}>
        <Table variant={"simple"} size={"sm"}>
          <TableCaption placement={"top"} m={0}>
            <Text fontSize={"xl"} color={"blue.500"}>
              Scored Campaigns
            </Text>
          </TableCaption>
          <Thead>
            <Tr>
              <Th>Campaign</Th>
              <Th>Product Name</Th>
              <Th>Score</Th>
              <Th>Reason</Th>
            </Tr>
          </Thead>
          <Tbody>
            {error && <ErrorRow colSpan={4} />}
            {isLoading && <LoadingDataRow colSpan={4} height={"lg"} />}
            {!isLoading && scoredCampaigns && scoredCampaigns.length == 0 && (
              <NoDataRow colSpan={4} />
            )}
            {scoredCampaigns &&
              scoredCampaigns.length > 0 &&
              scoredCampaigns.map(
                (scoredCampaign: ScoredCampaignWithCampaign) => (
                  <Tr key={scoredCampaign.id ?? JSON.stringify(scoredCampaign)}>
                    <Td>{scoredCampaign.campaign.name}</Td>
                    <Td>{scoredCampaign.campaign.productName}</Td>
                    <Td>{scoredCampaign.score}</Td>
                    <Td>{scoredCampaign.reason}</Td>
                  </Tr>
                )
              )}
          </Tbody>
          <Tfoot>
            <PaginationRow
              page={page}
              setPage={setPage}
              pageSize={pageSize}
              setPageSize={setPageSize}
              colSpan={4}
              size={"xs"}
              onMouseOverFn={() =>
                preload(
                  `/api/websites/${wsid}/webpages/${wpid}/scoredCampaigns?page=${
                    page + 1
                  }&pageSize=${pageSize}`,
                  fetcher
                )
              }
            />
          </Tfoot>
        </Table>
      </TableContainer>
    </>
  );
};

const Categories = () => {
  const router = useRouter();
  const { wsid, wpid } = router.query as QueryParams;
  const { categories, isLoading, error } = useCategoriesOfWebpage(wsid, wpid);
  return (
    <>
      <HStack>
        <Box minW={"3xs"}>Categories: </Box>
        <Box>
          {isLoading && <Spinner color={"blue.500"} />}
          {categories && (
            <HStack>
              {categories.map((c) => (
                <Tag key={c.id}>{c.name}</Tag>
              ))}
            </HStack>
          )}
          {!isLoading && categories && categories.length === 0 && (
            <WarningAlert
              showIcon={false}
              title={""}
              description={"None Found"}
            />
          )}
          {error && <ErrorAlert />}
        </Box>
      </HStack>
    </>
  );
};

const WebpageBox = ({
  webpage,
}: {
  webpage: WebpageWithAdSpotsAndOtherCounts;
}) => {
  console.log("in WebpageBox with: ", webpage);
  return (
    <VStack alignItems={"start"}>
      <HStack>
        <Box minW={"3xs"}>Id: </Box>
        <Box>{webpage.id}</Box>
      </HStack>
      <HStack>
        <Box minW={"3xs"}>Name: </Box>
        <Box><Link href={webpage.url} target={"_blank"} >
          {webpage.url} <ExternalLinkIcon mx='2px' mb={'2px'} />
        </Link></Box>
      </HStack>
      <HStack>
        <Box minW={"3xs"}>last Modified At: </Box>
        <Box>
          {formatISO(webpage.lastModifiedAt, {
            representation: "date",
          })}
        </Box>
      </HStack>
      <HStack>
        <Box minW={"3xs"}>Status: </Box>
        <Box>
          <StatusBadge status={webpage.status} />
        </Box>
      </HStack>
      <HStack>
        <Box minW={"3xs"}># of Ad Spots: </Box>
        <Box>{webpage._count.advertisementSpots}</Box>
      </HStack>
      <HStack>
        <Box minW={"3xs"}># of Scored Campaigns: </Box>
        <Box>{webpage._count.scoredCampaigns}</Box>
      </HStack>
      <HStack>
        <Box minW={"3xs"}># of Ads: </Box>
        <Box>
          {webpage.advertisementSpots.reduce(
            (pv, cv) => pv + cv._count.advertisements,
            0
          )}
        </Box>
      </HStack>
    </VStack>
  );
};

const Show = () => {
  const router = useRouter();
  const { wsid, wpid } = router.query as QueryParams;
  const { webpage, isLoading, error } = useWebpage(wsid, wpid);
  return (
    <Box>
      <HStack>
        <Heading my={5}>Webpage Details</Heading>
        <Spacer />
        <Button
          onClick={() => {
            router.push(
              `/websites/${wsid}/webpages/${wpid}/advertisements/list`
            );
          }}
          onMouseEnter={() => {
            preload(
              `/api/websites/${wsid}/webpages/${wpid}/advertisements`,
              fetcher
            );
          }}
          colorScheme={"blue"}
          rightIcon={<ArrowForwardIcon />}
        >
          {" "}
          Browse Advertisements
        </Button>
      </HStack>
      {isLoading && <Spinner color={"blue.500"} />}
      {error && <ErrorAlert />}
      {webpage && <WebpageBox webpage={webpage} />}
      <Box mt={2}>
        <Categories />
      </Box>
      <Box mt={5} border={"1px"} borderColor={"gray.200"} borderRadius={"md"}>
        <ScoredCampaigns />
      </Box>
      <HStack mt={5} spacing={5}>
        <Link href={`/websites/${wsid}/webpages/list`} colorScheme={"green"}>
          Return to the list of all Webpages
        </Link>
      </HStack>
    </Box>
  );
};

export default Show;
