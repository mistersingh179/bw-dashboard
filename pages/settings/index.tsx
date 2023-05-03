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

const Settings: FCWithAuth = () => {
  const { settings, error, isLoading, onSave } = useSettings();
  console.log("settings: ", settings);

  const [scoreThreshold, setScoreThreshold] = useState(
    settings?.scoreThreshold ?? 0
  );
  const [status, setStatus] = useState(settings?.status ?? false);

  useEffect(() => {
    console.log("status: ", status, "scoreThreshold: ", scoreThreshold);
  }, [status, scoreThreshold]);

  useEffect(() => {
    if (
      settings &&
      settings.scoreThreshold !== undefined &&
      settings.status !== undefined
    ) {
      setScoreThreshold(settings.scoreThreshold);
      setStatus(settings.status);
    }
  }, [settings?.scoreThreshold, settings?.status]);

  const handleStatus = (evt: React.ChangeEvent<HTMLInputElement>) => {
    setStatus(evt.target.checked);
  };

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
                onChangeHandler={setScoreThreshold}
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
                <Switch isChecked={status} onChange={handleStatus} />
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
              <Button
                colorScheme="blue"
                onClick={onSave.bind(this, { scoreThreshold, status })}
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
