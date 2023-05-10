import { useRouter } from "next/router";
import { QueryParams } from "@/types/QueryParams";
import {
  Box,
  Button,
  Heading,
  HStack,
  Spacer,
  Spinner,
  Text,
  VStack,
} from "@chakra-ui/react";
import React from "react";
import useWebpage from "@/hooks/useWepage";
import { ErrorAlert } from "@/components/genericMessages";
import { formatISO } from "date-fns";
import StatusBadge from "@/components/StatusBadge";
import { Link } from "@chakra-ui/next-js";
import { ArrowForwardIcon } from "@chakra-ui/icons";
import { preload } from "swr";
import fetcher from "@/helpers/fetcher";
import { WebpageWithAdSpotsAndOtherCounts } from "@/services/queries/getWebpageWithAdSpotsAndOtherCounts";

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
        <Box>{webpage.url}</Box>
      </HStack>
      <HStack>
        <Box minW={"3xs"}>Html: </Box>
        <Box>
          <Text maxWidth={"3xl"} noOfLines={5}>
            {webpage.html}
          </Text>
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
      <HStack mt={5} spacing={5}>
        <Link href={`/websites/${wsid}/webpages/list`} colorScheme={"green"}>
          Return to the list of all Webpages
        </Link>
      </HStack>
    </Box>
  );
};

export default Show;
