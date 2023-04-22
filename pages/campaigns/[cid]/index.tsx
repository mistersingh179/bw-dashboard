import React from "react";
import { useRouter } from "next/router";

import { Box, Heading, HStack, Spinner, VStack } from "@chakra-ui/react";
import FCWithAuth from "@/types/FCWithAuth";
import { Link } from "@chakra-ui/next-js";
import useSWR from "swr";
import { QueryParams } from "@/types/QueryParams";
import fetcher from "@/helpers/fetcher";
import { formatISO, parseISO } from "date-fns";
import { CampaignType } from "@/types/campaign-types";

const ErrorBox = () => {
  return <Box>There was an error processing your request. Try again?</Box>;
};

const LoadingBox = () => {
  return (
    <Box>
      <Spinner color={"blue.500"} />
    </Box>
  );
};

const CampaignBox = (props: { campaign: CampaignType }) => {
  const { campaign } = props;
  console.log("in campaignBox with: ", campaign);
  return (
    <VStack alignItems={"start"}>
      <HStack>
        <Box w={"3xs"}>Id: </Box>
        <Box>{campaign.id}</Box>
      </HStack>
      <HStack>
        <Box w={"3xs"}>Name: </Box>
        <Box>{campaign.name}</Box>
      </HStack>
      <HStack>
        <Box w={"3xs"}>Start: </Box>
        <Box>{formatISO(parseISO(campaign.start), {representation: "date"})}</Box>
      </HStack>
      <HStack>
        <Box w={"3xs"}>End: </Box>
        <Box>{formatISO(parseISO(campaign.end), {representation: "date"})}</Box>
      </HStack>
    </VStack>
  );
};

const ShowCampaign: FCWithAuth = () => {
  const router = useRouter();
  const { cid } = router.query as QueryParams;

  const {
    data: campaign,
    error,
    isLoading,
  } = useSWR<CampaignType>(`/api/campaigns/${cid}`, fetcher);

  return (
    <Box>
      <Heading my={5}>Campaign Details</Heading>
      {isLoading && <LoadingBox />}
      {error && <ErrorBox />}
      {campaign && <CampaignBox campaign={campaign} />}
      <Box mt={5}>
        <Link href={"/campaigns"} colorScheme={"green"}>
          Go to All Campaigns
        </Link>
      </Box>
    </Box>
  );
};

ShowCampaign.auth = true;

export default ShowCampaign;
