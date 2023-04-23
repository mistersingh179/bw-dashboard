import React, { useRef } from "react";
import { Box, Heading, ToastId, useToast } from "@chakra-ui/react";
import FCWithAuth from "@/types/FCWithAuth";
import { Link } from "@chakra-ui/next-js";
import { useSWRConfig } from "swr";
import CampaignForm from "@/components/CampaignForm";
import { CampaignType } from "@/types/campaign-types";
import useTxToast from "@/hooks/useTxToast";

const NewCampaign: FCWithAuth = () => {
  const { mutate } = useSWRConfig();
  const { success, failure } = useTxToast();

  const submitHandler = async (campaign: CampaignType) => {
    try {
      await mutate("/api/campaigns", createCampaign.bind(this, campaign), {
        optimisticData: (currentData: CampaignType[]) => {
          currentData = currentData ?? [];
          success("Campaign", "Created successfully");
          return [
            ...currentData,
            { ...campaign, id: Date(), optimisticValue: true },
          ];
        },
        populateCache: false,
      });
    } catch (err) {
      console.log("campaign creation mutation failed: ", err);
      failure("Campaign", "Rolling back as campaign creation failed!");
    }
  };

  const createCampaign = async (campaign: CampaignType) => {
    console.log("create payload: ", campaign);
    const res = await fetch("/api/campaigns", {
      method: "POST",
      body: JSON.stringify(campaign),
      headers: {
        "Content-Type": "application/json",
      },
    });
    console.log("res result: ", res.status);
    const data = await res.json();
    if (res.status >= 400) {
      throw new Error(data.message);
    } else {
      console.log("got new campaign: ", data);
      return data;
    }
  };

  return (
    <Box>
      <Heading my={5}>Create Campaign</Heading>
      <CampaignForm submitHandler={submitHandler} />
      <Box mt={5}>
        <Link href={"/campaigns/list"} colorScheme={"green"}>
          Go to All Campaigns
        </Link>
      </Box>
    </Box>
  );
};

NewCampaign.auth = true;

export default NewCampaign;
