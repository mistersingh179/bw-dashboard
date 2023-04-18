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
import useSWR, {mutate, useSWRConfig} from "swr";
import { Campaign as CampaignPrismaType } from "@prisma/client";
import { QueryParams } from "@/types/QueryParams";
import fetcher from "@/helpers/fetcher";
import campaign from "@/pages/api/campaigns/[cid]";
import {formatISO, parseISO} from "date-fns";
import CampaignForm from "@/components/CampaignForm";
import AnyObject from "@/types/AnyObject";

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

  const submitHandler = async (campaign: AnyObject) => {
    const {start, end, name, id} = campaign;
    console.log("in submit of edit: ", campaign);

    await mutate(`/api/campaigns`, editCampaign.bind(this, campaign), {
      optimisticData: (currentData: CampaignPrismaType[]) => {
        console.log("optimistic Data funcion called with: ", currentData)
        const updatedData = currentData.filter(x => x.id != id);
        return [
          ...updatedData,
          {...campaign, optimisticValue: true}
        ]
      },
      populateCache: false
    });
  }

  const editCampaign = async (campaign: AnyObject) => {
    console.log("in edit with: ", campaign);
    const res = await fetch(`/api/campaigns/${campaign.id}`, {
      method: "PUT",
      body: JSON.stringify(campaign),
      headers: {
        "Content-Type": "application/json",
      },
    });
    const data = await res.json();
    console.log("got updated campaign: ", data);
    return data;
  }

  campaign.start = formatISO(parseISO(campaign.start) , { representation: "date" });
  campaign.end = formatISO(parseISO(campaign.end) , { representation: "date" });

  return (
    <CampaignForm campaign={campaign} submitHandler={submitHandler} />
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

const EditCampaign: FCWithAuth = () => {
  const router = useRouter();
  const { cid } = router.query as QueryParams;

  const { data, error, isLoading } = useSWR<Campaign>(
    `/api/campaigns/${cid}`,
    fetcher
  );

  return (
    <Box>
      <Heading my={5}>Campaign Edit</Heading>
      {isLoading && <LoadingBox />}
      {error && <ErrorBox />}
      {data && <CampaignBox campaign={data} />}
      <Box mt={5}>
        <Link href={'/campaigns'} colorScheme={'green'}>Go to All Campaigns</Link>
      </Box>
    </Box>
  );
};

EditCampaign.auth = true;

export default EditCampaign;
