import React, {useRef} from "react";
import {Box, Heading, ToastId, useToast} from "@chakra-ui/react";
import FCWithAuth from "@/types/FCWithAuth";
import { Link } from "@chakra-ui/next-js";
import { useSWRConfig } from "swr";
import CampaignForm from "@/components/CampaignForm";
import { CampaignType } from "@/types/campaign-types";

const NewCampaign: FCWithAuth = () => {
  const { mutate } = useSWRConfig();
  const toast = useToast();
  const toastIdRef = useRef<ToastId>();

  const submitHandler = async (campaign: CampaignType) => {
    const { start, end, name } = campaign;
    try {
      console.log('toastIdRef.current: ', toastIdRef.current)
      await mutate("/api/campaigns", createCampaign.bind(this, campaign), {
        optimisticData: (currentData: CampaignType[]) => {
          currentData = currentData ?? [];
          console.log("optimistic Data function called with: ", currentData);
          toastIdRef.current = toast({
            title: "Campaign",
            description: "Created successfully",
            status: "success",
            duration: 3000,
            isClosable: true,
          });
          return [
            ...currentData,
            { id: Date(), start, end, name, optimisticValue: true },
          ];
        },
        populateCache: false,
      });
    } catch (err) {
      console.log("campaign creation mutation failed: ", err);
      if (toastIdRef.current) {
        console.log('closing');
        toast.close(toastIdRef.current)
      }
      toast({
        title: "Campaign",
        description: "Rolling back as campaign creation failed!",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const createCampaign = async (campaign: CampaignType) => {
    const { start, end, name } = campaign;

    const payload = {
      start,
      end,
      name,
    };
    console.log("create payload: ", payload);
    const res = await fetch("/api/campaigns", {
      method: "POST",
      body: JSON.stringify(payload),
      headers: {
        "Content-Type": "application/json",
      },
    });
    console.log("res result: ", res.status);
    if (res.status >= 400) {
      throw new Error("failed to fetch");
    } else {
      const data = await res.json();
      console.log("got new campaign: ", data);
      return data;
    }
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
