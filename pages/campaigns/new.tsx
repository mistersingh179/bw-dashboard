import React, { useState } from "react";
import { useSession } from "next-auth/react";
import {
  Alert,
  AlertIcon,
  Box,
  Button,
  FormControl,
  FormHelperText,
  FormLabel,
  Heading,
  Input,
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
import { addDays, formatISO } from "date-fns";
import { useSWRConfig } from "swr";
import { Campaign as CampaignPrismaType } from "@prisma/client";
import CampaignForm from "@/components/CampaignForm";
import AnyObject from "@/types/AnyObject";

type InputEvent = React.ChangeEvent<HTMLInputElement>;
type ButtonEvent = React.MouseEvent<HTMLButtonElement>;

const now = new Date();

const NewCampaign: FCWithAuth = () => {
  const { mutate } = useSWRConfig();

  const submitHandler = async (campaign: AnyObject) => {
    const {start, end, name} = campaign;

    await mutate("/api/campaigns", createCampaign.bind(this, campaign), {
      optimisticData: (currentData: CampaignPrismaType[]) => {
        console.log("optimistic Data funcion called with: ", currentData)
        return [
          ...currentData,
          {id: Date(), start, end, name, optimisticValue: true}
        ]
      },
      populateCache: false
    });
  }

  const createCampaign = async (campaign: AnyObject) => {
    const {start, end, name} = campaign;

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
        <Link href={'/campaigns'} colorScheme={'green'}>Go to All Campaigns</Link>
      </Box>
    </Box>
  );
};

NewCampaign.auth = true;

export default NewCampaign;
