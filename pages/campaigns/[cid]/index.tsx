import React, { ReactNode, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";

import {
  Alert,
  AlertIcon,
  Box,
  Button,
  FormControl,
  FormHelperText,
  FormLabel,
  Heading,
  HStack,
  Input,
  Spinner,
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
import useSWR, { useSWRConfig } from "swr";
import { Campaign as CampaignPrismaType } from "@prisma/client";
import { QueryParams } from "@/types/QueryParams";
import fetcher from "@/helpers/fetcher";
import campaign from "@/pages/api/campaigns/[cid]";
import {formatISO, parseISO} from "date-fns";

const now = new Date();

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

type CampaignProps = {
  campaign: Campaign;
};

const CampaignBox = (props: CampaignProps) => {
  const { campaign } = props;
  console.log("in campaignBox with: ", campaign)
  return (
    <VStack alignItems={'start'}>
      <HStack>
        <Box w={'3xs'}>Id: </Box>
        <Box>{campaign.id}</Box>
      </HStack>
      <HStack>
        <Box w={'3xs'}>Name: </Box>
        <Box>{campaign.name}</Box>
      </HStack>
      <HStack>
        <Box w={'3xs'}>Start: </Box>
        <Box>{formatISO(parseISO(campaign?.start), {representation: "date"})}</Box>
      </HStack>
      <HStack>
        <Box w={'3xs'}>End: </Box>
        <Box>{formatISO(parseISO(campaign?.end), {representation: "date"})}</Box>
      </HStack>
    </VStack>
  );
};

export type Campaign = {
  id: string
  name: string
  start: string
  end: string
  createdAt: Date
  updatedAt: Date
  userId: string
}

const ShowCampaign: FCWithAuth = () => {
  const router = useRouter();
  const { cid } = router.query as QueryParams;

  const { data, error, isLoading } = useSWR<Campaign>(
    `/api/campaigns/${cid}`,
    fetcher
  );

  return (
    <Box>
      <Heading my={5}>Campaign Details</Heading>
      {isLoading && <LoadingBox />}
      {error && <ErrorBox />}
      {data && <CampaignBox campaign={data} />}
      <Box mt={5}>
        <Link href={'/campaigns'} colorScheme={'green'}>Go to All Campaigns</Link>
      </Box>
    </Box>
  );
};

ShowCampaign.auth = true;

export default ShowCampaign;
