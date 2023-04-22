import React from "react";
import { Box, Heading } from "@chakra-ui/react";
import FCWithAuth from "@/types/FCWithAuth";
import { Link, Image } from "@chakra-ui/next-js";
import { useSWRConfig } from "swr";
import CampaignForm from "@/components/CampaignForm";
import { CampaignType } from "@/types/campaign-types";

const NewCampaign: FCWithAuth = () => {
  const { mutate } = useSWRConfig();

  const submitHandler = async (campaign: CampaignType) => {
    const { start, end, name } = campaign;

    await mutate("/api/campaigns", createCampaign.bind(this, campaign), {
      optimisticData: (currentData: CampaignType[]) => {
        console.log("optimistic Data function called with: ", currentData);
        return [
          ...currentData,
          { id: Date(), start, end, name, optimisticValue: true },
        ];
      },
      populateCache: false,
    });
  };

  const createCampaign = async (campaign: CampaignType) => {
    const { start, end, name } = campaign;

    const payload = {
      start,
      end,
      name,
    };
    console.log(payload);
    const res = await fetch("/api/campaigns", {
      method: "POST",
      body: JSON.stringify(payload),
      headers: {
        "Content-Type": "application/json",
      },
    });
    const data = await res.json();
    console.log("got new campaign: ", data);
    return data;
  };

  return (
    <Box>
      <Heading my={5}>Create Campaign</Heading>
      <CampaignForm submitHandler={submitHandler} />
      <Box mt={5}>
        <Link href={"/campaigns"} colorScheme={"green"}>
          Go to All Campaigns
        </Link>
      </Box>
    </Box>
  );
};

NewCampaign.auth = true;

export default NewCampaign;
