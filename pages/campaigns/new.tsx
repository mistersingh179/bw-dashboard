import React, { useRef, useState } from "react";
import { Box, Heading, ToastId, useToast } from "@chakra-ui/react";
import FCWithAuth from "@/types/FCWithAuth";
import { Link } from "@chakra-ui/next-js";
import { useSWRConfig } from "swr";
import CampaignForm, { CategoryOptionType } from "@/components/CampaignForm";
import { CampaignType } from "@/types/my-types";
import useTxToast from "@/hooks/useTxToast";
import superjson from "superjson";
import { Campaign } from "@prisma/client";
import { setCategoriesOnCampaign } from "@/hooks/useCategoriesOfCampaign";

const NewCampaign: FCWithAuth = () => {
  const { mutate } = useSWRConfig();
  const { success, failure } = useTxToast();

  const submitHandler = async (
    campaign: CampaignType,
    selectedCategoryOptions: CategoryOptionType[]
  ) => {
    console.log(
      "got: ",
      campaign,
      selectedCategoryOptions,
      " to create new campaign"
    );
    try {
      const newCampaign = await mutate(
        "/api/campaigns",
        createCampaign.bind(this, campaign),
        {
          optimisticData: (currentData: CampaignType[]) => {
            currentData = currentData ?? [];
            success("Campaign", "Created successfully");
            return [...currentData, { ...campaign }];
          },
          populateCache: false,
        }
      );
      const categoryIds = selectedCategoryOptions.map((c) => c.value);
      try {
        success(
          "Campaign Categories",
          "Successfully Saved Campaign Categories"
        );
        await mutate(
          `api/campaigns/${newCampaign.id}/categories`,
          setCategoriesOnCampaign.bind(this, newCampaign.id, categoryIds),
          { populateCache: false }
        );
      } catch (err) {
        console.log("campaign categories save failed: ", err);
        failure("Campaign Categories", "Rolling back as saving failed!");
      }
    } catch (err) {
      console.log("campaign creation mutation failed: ", err);
      failure("Campaign", "Rolling back as creation failed!");
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
    const text = await res.text();
    const data = await superjson.parse<any>(text);
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
