import React from "react";
import { useRouter } from "next/router";

import {
  Box,
  Heading,
  Spinner,
} from "@chakra-ui/react";
import FCWithAuth from "@/types/FCWithAuth";
import { Link, Image } from "@chakra-ui/next-js";
import useSWR, {mutate, useSWRConfig} from "swr";
import { QueryParams } from "@/types/QueryParams";
import fetcher from "@/helpers/fetcher";
import {formatISO, parseISO} from "date-fns";
import CampaignForm from "@/components/CampaignForm";
import {CampaignType} from "@/types/campaign-types";

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

const CampaignBox = (props: {campaign: CampaignType}) => {
  const {campaign} = props;
  console.log("in campaignBox with: ", campaign)

  const submitHandler = async (campaign: CampaignType) => {
    const {start, end, name, id} = campaign;
    console.log("in submit of edit: ", campaign);

    await mutate(`/api/campaigns`, editCampaign.bind(this, campaign), {
      optimisticData: (currentData: CampaignType[]) => {
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

  const editCampaign = async (campaign: CampaignType) => {
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

const EditCampaign: FCWithAuth = () => {
  const router = useRouter();
  const { cid } = router.query as QueryParams;

  const { data: campaign, error, isLoading } = useSWR<CampaignType>(
    `/api/campaigns/${cid}`,
    fetcher
  );

  return (
    <Box>
      <Heading my={5}>Campaign Edit</Heading>
      {isLoading && <LoadingBox />}
      {error && <ErrorBox />}
      {campaign && <CampaignBox campaign={campaign} />}
      <Box mt={5}>
        <Link href={'/campaigns'} colorScheme={'green'}>Go to All Campaigns</Link>
      </Box>
    </Box>
  );
};

EditCampaign.auth = true;

export default EditCampaign;
