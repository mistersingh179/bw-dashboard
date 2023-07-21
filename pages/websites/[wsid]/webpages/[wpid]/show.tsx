import { useRouter } from "next/router";
import { QueryParams } from "@/types/QueryParams";
import {
  Box,
  Button,
  Heading,
  HStack,
  Skeleton,
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
  Tooltip,
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
import { formatISO, isAfter, isBefore } from "date-fns";
import StatusBadge from "@/components/StatusBadge";
import { Link } from "@chakra-ui/next-js";
import { ArrowForwardIcon, ExternalLinkIcon } from "@chakra-ui/icons";
import { preload } from "swr";
import fetcher from "@/helpers/fetcher";
import { WebpageWithAdSpotsAndOtherCounts } from "@/services/queries/getWebpageWithAdSpotsAndOtherCounts";
import useCategoriesOfWebpage from "@/hooks/useCategoriesOfWebpage";
import useScoredCampaignsOfWebpage from "@/hooks/useScoredCampaignsOfWebpage";
import usePagination from "@/hooks/usePagination";
import PaginationRow from "@/components/PaginationRow";
import { ScoredCampaignWithCampaign } from "@/pages/api/websites/[wsid]/webpages/[wpid]/scoredCampaigns";
import useAdsOfBestCampaign from "@/hooks/useAdsOfBestCampaign";
import numeral from "numeral";
import { AdvertisementWithSpotAndCampaign } from "@/pages/api/websites/[wsid]/webpages/[wpid]/adsOfBestCampaign";
import useCampWithImpCount from "@/hooks/useCampWithImpCount";
import { Campaign } from "@prisma/client";
import campaigns from "@/pages/api/campaigns";

type AdsBoxProps = {
  ads: AdvertisementWithSpotAndCampaign[];
};
const AdsBox = (props: AdsBoxProps) => {
  const { ads } = props;
  return (
    <>
      {ads.map((ad) => {
        return (
          <VStack
            key={ad.id}
            alignItems={"start"}
            mt={5}
            p={5}
            border={"1px"}
            borderColor={"gray.200"}
            borderRadius={"md"}
          >
            <HStack alignItems={"start"}>
              <Box minW={"3xs"}>Before: </Box>
              <Box>{ad.advertisementSpot.beforeText}</Box>
            </HStack>
            <HStack alignItems={"start"}>
              <Box minW={"3xs"}>Ad: </Box>
              <Box>{ad.advertText}</Box>
            </HStack>
            <HStack alignItems={"start"}>
              <Box minW={"3xs"}>After</Box>
              <Box>{ad.advertisementSpot.afterText}</Box>
            </HStack>
            <HStack alignItems={"start"}>
              <Box minW={"3xs"}>Score</Box>
              <Box>{ad.scoredCampaign.score}</Box>
            </HStack>
            <HStack alignItems={"start"}>
              <Box minW={"3xs"}>Reason</Box>
              <Box>{ad.scoredCampaign.reason}</Box>
            </HStack>
            <HStack alignItems={"start"}>
              <Box minW={"3xs"}>Campaign Name</Box>
              <Box>{ad.scoredCampaign.campaign.name}</Box>
            </HStack>
            <HStack alignItems={"start"}>
              <Box minW={"3xs"}>Product Name</Box>
              <Box>{ad.scoredCampaign.campaign.productName}</Box>
            </HStack>
            <HStack alignItems={"start"}>
              <Box minW={"3xs"}>CPM</Box>
              <Box>
                {numeral(ad.scoredCampaign.campaign.fixedCpm).format(
                  "$0.0[.]00"
                )}
              </Box>
            </HStack>
          </VStack>
        );
      })}
    </>
  );
};

const AdsOfBestCampaign = () => {
  const router = useRouter();
  const { wsid, wpid } = router.query as QueryParams;
  const { advertisements, isLoading, error } = useAdsOfBestCampaign(wsid, wpid);

  return (
    <>
      <Heading size={"md"} mb={4}>
        Matched Ads
      </Heading>
      {isLoading && <Spinner color={"blue.500"} />}
      {error && <ErrorAlert />}
      {(!advertisements || advertisements.length == 0) && (
        <WarningAlert description={"There are no matched ads"} />
      )}
      {advertisements && <AdsBox ads={advertisements} />}
    </>
  );
};

type InFlightMessagePropsType = { campaign: Campaign };
export const InFlightMessage = (props: InFlightMessagePropsType) => {
  const { campaign } = props;
  const now = new Date();
  const active = isAfter(campaign.end, now) && isBefore(campaign.start, now);

  return (
    <Tooltip
      label={
        <VStack spacing={0} alignItems={"start"}>
          <Box>
            Start:{" "}
            {formatISO(campaign.start, {
              representation: "date",
            })}{" "}
          </Box>
          <Box>
            End:{" "}
            {formatISO(campaign.end, {
              representation: "date",
            })}{" "}
          </Box>
        </VStack>
      }
    >
      <span>{active ? "Yes" : "No"}</span>
    </Tooltip>
  );
};

type ImpDeliveryMessagePropsType = {
  campaign: Campaign;
  campsWithImpCount: { [key: string]: number };
};

export const ImpDeliveryMessage = (props: ImpDeliveryMessagePropsType) => {
  const { campaign, campsWithImpCount } = props;

  return (
    <>
      <Skeleton
        isLoaded={campaign && campsWithImpCount[campaign.id] ? true : false}
      >
        <Tooltip
          label={
            <VStack spacing={0} alignItems={"start"}>
              <HStack>
                <Box>Delivered: </Box>
                <Box>
                  {numeral(campsWithImpCount[campaign.id]).format("0,0")}
                </Box>
              </HStack>
              <HStack justifyContent={"start"}>
                <Box>Cap:</Box>
                <Box>{numeral(campaign.impressionCap).format("0,0")}</Box>
              </HStack>
            </VStack>
          }
        >
          <span>
            {numeral(campsWithImpCount[campaign.id]).format("0,0")} /{" "}
            {numeral(campaign.impressionCap).format("0,0")}
          </span>
        </Tooltip>
      </Skeleton>
    </>
  );
};

const ScoredCampaigns = () => {
  const router = useRouter();
  const { wsid, wpid } = router.query as QueryParams;
  const { page, setPage, pageSize, setPageSize } = usePagination(1, 25);
  const { scoredCampaigns, isLoading, error } = useScoredCampaignsOfWebpage(
    wsid,
    wpid,
    page,
    pageSize
  );
  const {
    campsWithImpCount,
    isLoading: isLoadingCampWithImpCount,
    error: errorCampWithImpCount,
  } = useCampWithImpCount();
  return (
    <>
      <Heading size={"md"} my={4} pl={3}>
        Scored Campaigns
      </Heading>
      <TableContainer whiteSpace={"normal"}>
        <Table variant={"simple"} size={"sm"}>
          <Thead>
            <Tr>
              <Th>Campaign</Th>
              <Th>CPM</Th>
              <Th>Delivery</Th>
              <Th>In-Flight</Th>
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
                (scoredCampaign: ScoredCampaignWithCampaign) => {
                  return (
                    <Tr
                      bg={scoredCampaign.isBest ? "green.50" : "gray.50"}
                      key={scoredCampaign.id ?? JSON.stringify(scoredCampaign)}
                    >
                      <Td>
                        <Tooltip
                          label={
                            scoredCampaign.isBest
                              ? "Currently matched Campaign"
                              : ""
                          }
                        >
                          {scoredCampaign.campaign.name}
                        </Tooltip>
                      </Td>
                      <Td>
                        {numeral(scoredCampaign.campaign.fixedCpm).format(
                          "$0.0[.]00"
                        )}
                      </Td>
                      <Td>
                        <ImpDeliveryMessage
                          campaign={scoredCampaign.campaign}
                          campsWithImpCount={campsWithImpCount}
                        />
                      </Td>
                      <Td>
                        <InFlightMessage campaign={scoredCampaign.campaign} />
                      </Td>
                      <Td>{scoredCampaign.campaign.productName}</Td>
                      <Td>{scoredCampaign.score}</Td>
                      <Td>{scoredCampaign.reason}</Td>
                    </Tr>
                  );
                }
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
        <Box>
          <Link href={webpage.url} target={"_blank"}>
            {webpage.url} <ExternalLinkIcon mx="2px" mb={"2px"} />
          </Link>
        </Box>
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
      </HStack>
      {isLoading && <Spinner color={"blue.500"} />}
      {error && <ErrorAlert />}
      {webpage && <WebpageBox webpage={webpage} />}
      <Box mt={2}>
        <Categories />
      </Box>
      <Box
        mt={5}
        p={5}
        border={"1px"}
        borderColor={"gray.200"}
        borderRadius={"md"}
      >
        <AdsOfBestCampaign />
      </Box>
      <Box mt={5} border={"1px"} borderColor={"gray.200"} borderRadius={"md"}>
        <ScoredCampaigns />
      </Box>
      <HStack my={5} spacing={5}>
        <Link href={`/websites/${wsid}/webpages/list`} colorScheme={"green"}>
          Return to the list of all Webpages
        </Link>
        <Box>|</Box>
        <Link
          href={`/websites/${wsid}/webpages/${wpid}/advertisements/list`}
          colorScheme={"green"}
          onMouseEnter={() => {
            preload(
              `/api/websites/${wsid}/webpages/${wpid}/advertisements`,
              fetcher
            );
          }}
        >
          Browse All Advertisements
        </Link>
      </HStack>
    </Box>
  );
};

export default Show;
