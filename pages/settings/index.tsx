import FCWithAuth from "@/types/FCWithAuth";
import NewCampaign from "@/pages/campaigns/new";
import {
  Box,
  Button,
  FormControl,
  FormErrorMessage,
  FormHelperText,
  FormLabel,
  Heading,
  HStack,
  Input,
  Progress,
  Spinner,
  Switch,
  Text,
  VStack,
} from "@chakra-ui/react";
import CampaignForm from "@/components/CampaignForm";
import { Link } from "@chakra-ui/next-js";
import React, { useEffect, useState } from "react";
import SliderThumbWithTooltip from "@/components/SliderThumbWithTooltip";
import useSettings from "@/hooks/useSettings";
import { ErrorAlert, ErrorRow, NoDataRow } from "@/components/genericMessages";
import {SettingType} from "@/types/my-types";

const Settings: FCWithAuth = () => {
  const { settings, error, isLoading, onSave } = useSettings();

  const defaultValues: SettingType = {
    contentSelector: "",
    desiredAdvertisementCount: 0,
    desiredAdvertisementSpotCount: 0,
    minCharLimit: 0,
    sameTypeElemWithTextToFollow: false,
    webpageLookbackDays: 0,
    scoreThreshold: 0,
    status: false,
    addSponsoredWording: false
  };

  const [items, setItems] = useState(defaultValues);
  const updateItem = (itemName: string, itemValue: any) => {
    setItems((prevState) => ({
      ...prevState,
      [itemName]: itemValue,
    }));
  };
  const { scoreThreshold, status, addSponsoredWording } = items;

  useEffect(() => {
    if (settings) {
      console.log("got updated settings: ", settings);
      setItems(settings);
    }
  }, [settings]);

  return (
    <Box>
      <Heading my={5}>Settings Campaign</Heading>
      <VStack spacing={5}>
        {error && <ErrorAlert />}
        {isLoading && <Spinner color={"blue.500"} />}
        {settings && (
          <Box>
            <FormControl>
              <FormLabel>Score Threshold</FormLabel>
              <SliderThumbWithTooltip
                value={scoreThreshold}
                onChangeHandler={(val) => updateItem("scoreThreshold", val)}
              />
              <FormHelperText my={7} lineHeight={1.5}>
                <Text>
                  Instructions: Select the minimum score for campaign product
                  relevancy.
                </Text>
                <Text my={1}>
                  This value is used to define the minimum score a
                  campaign&apos;s product must receive in order to be considered
                  relevant to a webpage. Only campaigns that meet or exceed this
                  score will be eligible to run on the webpage.
                </Text>
              </FormHelperText>
              <FormHelperText></FormHelperText>
            </FormControl>
            <FormControl>
              <HStack>
                <FormLabel mb={0}>Status</FormLabel>
                <Switch
                  isChecked={status}
                  onChange={(evt) => updateItem("status", evt.target.checked)}
                />
              </HStack>
              <FormHelperText my={7} lineHeight={1.5}>
                <Text>Instructions: Turn On/Off BrandWeaver Script</Text>
                <Text my={1}>
                  This toggle switch allows you to turn on or off the
                  BrandWeaver script. If you turn it off, the script will stop
                  working on all websites and all pages for all campaigns. This
                  is a global on/off switch. If you want to control the script
                  more granularly, you can pause individual campaigns, websites,
                  or pages.
                </Text>
                <Text my={1}>
                  Note: If you turn off the BrandWeaver script, it will stop
                  running on all websites and all pages, and you will need to
                  turn it back on to use it again.
                </Text>
              </FormHelperText>
              <FormHelperText></FormHelperText>
            </FormControl>
            <FormControl>
              <HStack>
                <FormLabel mb={0}>Add Sponsored Wording</FormLabel>
                <Switch
                  isChecked={addSponsoredWording}
                  onChange={(evt) =>
                    updateItem("addSponsoredWording", evt.target.checked)
                  }
                />
              </HStack>
              <FormHelperText my={7} lineHeight={1.5}>
                <Text>
                  Instructions: Toggle this switch to enable sponsored content
                  notifications.
                </Text>
                <Text my={1}>
                  When the toggle is ON: Generated advertisements will include
                  wording indicating that they are sponsored.
                </Text>
                <Text my={1}>
                  When the toggle is OFF (default): Generated advertisements
                  will not have any additional wording to indicate whether they
                  are sponsored or not.
                </Text>
                <Text my={1}>
                  Note: The sponsored content toggle provides transparency and
                  helps readers distinguish between regular and sponsored
                  messages.
                </Text>
              </FormHelperText>
              <FormHelperText></FormHelperText>
            </FormControl>
            <FormControl>
              <Button
                colorScheme="blue"
                onClick={() => {
                  onSave({
                    ...items,
                  });
                }}
              >
                Save
              </Button>
            </FormControl>
          </Box>
        )}
      </VStack>
    </Box>
  );
};

Settings.auth = true;

export default Settings;
