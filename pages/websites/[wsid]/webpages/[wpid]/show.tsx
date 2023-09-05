import { useRouter } from "next/router";
import { QueryParams } from "@/types/QueryParams";
import {
  Box, Divider,
  Heading,
  HStack,
  Skeleton,
  Spacer,
  Spinner,
  Table,
  TableContainer,
  Tag,
  Tbody,
  Td,
  Tfoot,
  Th,
  Thead,
  Tooltip,
  Tr,
  VStack,
  Wrap,
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
import { ExternalLinkIcon } from "@chakra-ui/icons";
import { preload } from "swr";
import fetcher from "@/helpers/fetcher";
import {
  MetaContentSpotsWithMetaContentAndType,
  WebpageWithAdSpotsAndOtherCounts,
} from "@/services/queries/getWebpageWithAdSpotsAndOtherCounts";
import useCategoriesOfWebpage from "@/hooks/useCategoriesOfWebpage";
import useScoredCampaignsOfWebpage from "@/hooks/useScoredCampaignsOfWebpage";
import usePagination from "@/hooks/usePagination";
import PaginationRow from "@/components/PaginationRow";
import { ScoredCampaignWithCampaign } from "@/pages/api/websites/[wsid]/webpages/[wpid]/scoredCampaigns";
import useAdsOfBestCampaign from "@/hooks/useAdsOfBestCampaign";
import numeral from "numeral";
import { AdvertisementWithSpotAndCampaign } from "@/pages/api/websites/[wsid]/webpages/[wpid]/adsOfBestCampaign";
import useCampWithImpCount from "@/hooks/useCampWithImpCount";
import { AdvertisementSpot, Campaign, MetaContentSpot } from "@prisma/client";

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
        isLoaded={
          campaign &&
          campsWithImpCount[campaign.id] != null &&
          campsWithImpCount[campaign.id] != undefined
        }
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

const AdSpots = ({
  adSpots,
}: {
  adSpots: AdvertisementSpot[] | null | undefined;
}) => {
  return (
    <>
      <Heading size={"md"} my={4} pl={3}>
        Ad Spots
      </Heading>
      {(!adSpots || adSpots.length == 0) && (
        <WarningAlert
          description={"Ad Spots have not been built yet. Try later."}
        />
      )}
      {adSpots &&
        adSpots.map((adSpot) => {
          return (
            <VStack
              key={adSpot.id}
              alignItems={"start"}
              mt={5}
              p={5}
              border={"1px"}
              borderColor={"gray.200"}
              borderRadius={"md"}
            >
              <HStack alignItems={"start"} key={adSpot.id}>
                <Box minW={"4xs"}>Before: </Box>
                <Box>{adSpot.beforeText}</Box>
              </HStack>
              <HStack alignItems={"start"}>
                <Box minW={"4xs"}>After: </Box>
                <Box>{adSpot.afterText}</Box>
              </HStack>
            </VStack>
          );
        })}
    </>
  );
};

const MetaContentSpots = ({
  metaContentSpots,
}: {
  metaContentSpots: MetaContentSpotsWithMetaContentAndType[] | null | undefined;
}) => {
  return (
    <>
      <Heading size={"md"} my={4} pl={3}>
        Meta Content Spots
      </Heading>
      {(!metaContentSpots || metaContentSpots.length == 0) && (
        <WarningAlert
          description={"Meta Content Spots have not been built yet. Try later."}
        />
      )}
      {metaContentSpots &&
        metaContentSpots.length > 0 &&
        metaContentSpots.map((mcs) => {
          return (
            <VStack
              key={mcs.id}
              alignItems={"start"}
              mt={5}
              p={5}
              border={"1px"}
              borderColor={"gray.200"}
              borderRadius={"md"}
            >
              <HStack alignItems={"start"}>
                <Box minW={"3xs"}>Spot Text: </Box>
                <Box>{mcs.contentText}</Box>
              </HStack>
              <HStack alignItems={"start"}>
                <Box minW={"3xs"}>Build Fail Count : </Box>
                <Box>{mcs.buildFailCount}</Box>
              </HStack>
              <Divider />
              <TableContainer whiteSpace={"normal"} w={'full'}>
                <Table variant={"simple"} size={"sm"}>
                  <Thead>
                    <Tr>
                      <Th>Meta Text</Th>
                      <Th>Meta Heading</Th>
                      <Th>Content Type</Th>
                      <Th>Diversity Classification</Th>
                      <Th>Status</Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {(!mcs || !mcs.metaContents || mcs.metaContents.length == 0) && (
                      <NoDataRow colSpan={6} />
                    )}
                    {mcs &&
                      mcs.metaContents &&
                      mcs.metaContents.length > 0 &&
                      mcs.metaContents.map((mc) => {
                        return (
                          <Tr key={mc.id}>
                            <Td>{mc.generatedText}</Td>
                            <Td>{mc.generatedHeading}</Td>
                            <Td>{mc.metaContentType.name}</Td>
                            <Td>
                              <Tooltip label={mc.diveristyClassifierReason}>
                                {mc.diveristyClassifierResult || ""}
                              </Tooltip>
                            </Td>
                            <Td>
                              <StatusBadge
                                status={mc.status}
                              />
                            </Td>
                          </Tr>
                        );
                      })}
                  </Tbody>
                </Table>
              </TableContainer>
            </VStack>
          );
        })}
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
            {error && <ErrorRow colSpan={7} />}
            {isLoading && <LoadingDataRow colSpan={7} height={"lg"} />}
            {!isLoading && scoredCampaigns && scoredCampaigns.length == 0 && (
              <NoDataRow colSpan={7} />
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
                            scoredCampaign.isBest ? "Currently matched" : ""
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
            <Wrap spacing={2}>
              {categories.map((c) => (
                <Tag key={c.id}>{c.name}</Tag>
              ))}
            </Wrap>
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
        <Box minW={"3xs"}>Url: </Box>
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
        <Box minW={"3xs"}>Title: </Box>
        <Box noOfLines={1}>{webpage.content?.title ?? "-"}</Box>
      </HStack>
      <HStack>
        <Box minW={"3xs"}>Description: </Box>
        <Box noOfLines={2}>{webpage.content?.description ?? "-"}</Box>
      </HStack>
      <HStack>
        <Box minW={"3xs"}># of Ad Spots: </Box>
        <Box>{webpage._count.advertisementSpots}</Box>
        <Box>
          {webpage?.content && (
            <Tag colorScheme={"blue"}>
              <Link
                href={`/api/websites/${webpage.websiteId}/webpages/${webpage.id}/adSpotPreview`}
                target={"_blank"}
              >
                Preview <ExternalLinkIcon mx="2px" mb={"2px"} />
              </Link>
            </Tag>
          )}
        </Box>
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
        <MetaContentSpots metaContentSpots={webpage?.metaContentSpots} />
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
      <Box
        mt={5}
        p={5}
        border={"1px"}
        borderColor={"gray.200"}
        borderRadius={"md"}
      >
        <AdSpots adSpots={webpage?.advertisementSpots} />
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
