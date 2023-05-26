import FCWithAuth from "@/types/FCWithAuth";
import {
  Box,
  Heading,
  HStack,
  Icon,
  Switch,
  Table,
  TableCaption,
  TableContainer,
  Tbody,
  Td,
  Th,
  Thead,
  Tooltip,
  Tr,
} from "@chakra-ui/react";
import React from "react";
import {
  ErrorRow,
  LoadingDataRow,
  NoDataRow,
} from "@/components/genericMessages";
import { QueryParams } from "@/types/QueryParams";
import { useRouter } from "next/router";

import useAdvertisementsWithDetail from "@/hooks/useAdvertisementsWithDetail";
import Link from "next/link";
import { AdvertisementWithDetail } from "@/services/queries/getAdvertisementsForWebpage";
import useWebpage from "@/hooks/useWepage";
import { format, isAfter, isBefore } from "date-fns";
import { disabledProps } from "@/pages/campaigns/list";
import useSettings from "@/hooks/useSettings";
import { Category } from ".prisma/client";
import { intersection } from "lodash";
import { AiOutlineEye } from "react-icons/ai";
import useCategoriesOfWebpage from "@/hooks/useCategoriesOfWebpage";
// import useTxToast from "@/hooks/useTxToast";

const Advertisements: FCWithAuth = () => {
  const router = useRouter();
  const { wsid, wpid } = router.query as QueryParams;
  const { advertisements, error, isLoading, onUpdate } =
    useAdvertisementsWithDetail(wsid, wpid);
  const {
    webpage,
    isLoading: isLoadingWp,
    error: errorWp,
  } = useWebpage(wsid, wpid);
  const {
    settings,
    isLoading: isLoadingSettings,
    error: errorSettings,
  } = useSettings();
  const { categories: webpageCategories } = useCategoriesOfWebpage(wsid, wpid);

  const now = new Date();

  const isThereCategoryOverlap = (
    categsOfWp: string[],
    categsOfCamp: string[]
  ): boolean => {
    if(categsOfCamp.length === 0){
      return true
    }else{
      const common = intersection(categsOfWp, categsOfCamp);
      return common.length > 0 ? true : false;
    }
  };

  type AdvertisementRunningResult = {
    running: boolean;
    whyNot?: string;
  };

  const isRunning = (
    advertisement: AdvertisementWithDetail
  ): AdvertisementRunningResult => {
    const categsOfWp = advertisement.advertisementSpot.webpage.categories.map(
      (c) => c.name
    );
    const categsOfCamp = advertisement.scoredCampaign.campaign.categories.map(
      (c) => c.name
    );

    if (advertisement.status === false) {
      return {
        running: false,
        whyNot: "advertisement is paused",
      };
    } else if (advertisement.scoredCampaign.campaign.status === false) {
      return {
        running: false,
        whyNot: "campaign is paused",
      };
    } else if (isAfter(advertisement.scoredCampaign.campaign.start, now)) {
      return {
        running: false,
        whyNot: "campaign hasn't started.",
      };
    } else if (isBefore(advertisement.scoredCampaign.campaign.end, now)) {
      return {
        running: false,
        whyNot: "campaign has ended.",
      };
    } else if (
      settings &&
      advertisement.scoredCampaign.score < settings.scoreThreshold
    ) {
      return {
        running: false,
        whyNot: `campaign's relevancy score (${advertisement.scoredCampaign.score}) is below users required threshold (${settings.scoreThreshold})`,
      };
    } else if (!isThereCategoryOverlap(categsOfWp, categsOfCamp)) {
      return {
        running: false,
        whyNot: `campaign categories (${categsOfCamp.join(
          ","
        )}) are not included in the webpage categories (${categsOfWp.join(
          ","
        )}).`,
      };
    } else {
      return {
        running: true,
      };
    }
  };

  return (
    <Box>
      <HStack alignItems={"baseline"} my={5}>
        <Heading>Advertisements</Heading>
        {webpage && (
          <Heading color={"gray.400"} size={"sm"}>
            <Tooltip label={webpageCategories?.map(c => c.name).join(",")}>
            <Link href={`/websites/${wsid}/webpages/${wpid}/show`}>
              – {webpage.url}
            </Link>
            </Tooltip>
          </Heading>
        )}
      </HStack>
      <TableContainer whiteSpace={"normal"}>
        <Table variant="simple" colorScheme="gray" size={"sm"}>
          <Thead>
            <Tr>
              <Th>Name</Th>
              <Th>Score</Th>
              <Th>Product</Th>
              <Th>Advertisement</Th>
              <Th>Status</Th>
              <Th>Will Show</Th>
            </Tr>
          </Thead>
          <Tbody>
            {error && <ErrorRow colSpan={5} />}
            {isLoading && <LoadingDataRow colSpan={5} />}
            {!isLoading && advertisements && advertisements.length == 0 && (
              <NoDataRow colSpan={5} />
            )}
            {advertisements &&
              advertisements.length > 0 &&
              advertisements.map((advertisement: AdvertisementWithDetail) => (
                <Tr key={advertisement.id}>
                  <Td>
                    <Tooltip
                      label={
                        <Box>
                          Start:{" "}
                          {format(
                            advertisement.scoredCampaign.campaign.start,
                            "yyyy/MM/dd"
                          )}
                          <br />
                          End:{" "}
                          {format(
                            advertisement.scoredCampaign.campaign.end,
                            "yyyy/MM/dd"
                          )}
                          <br />
                          Status:{" "}
                          {advertisement.scoredCampaign.campaign.status
                            ? "On"
                            : "Off"}
                          <br />
                          Categories:{" "}
                          {advertisement.scoredCampaign.campaign.categories
                            .map((c) => c.name)
                            .join(",")}
                        </Box>
                      }
                    >
                      {advertisement.scoredCampaign.campaign.name}
                    </Tooltip>
                  </Td>
                  <Td>
                    <Tooltip label={advertisement.scoredCampaign.reason}>
                      {advertisement.scoredCampaign.score.toString()}
                    </Tooltip>
                  </Td>
                  <Td>
                    <Tooltip
                      label={
                        advertisement.scoredCampaign.campaign.productDescription
                      }
                    >
                      {advertisement.scoredCampaign.campaign.productName}
                    </Tooltip>
                  </Td>
                  <Td>
                    <Tooltip
                      label={
                        <Box>
                          Before: {advertisement.advertisementSpot.beforeText}
                          <br />
                          After: {advertisement.advertisementSpot.afterText}
                        </Box>
                      }
                    >
                      {advertisement.advertText}
                    </Tooltip>
                  </Td>
                  <Td>
                    <Switch
                      isChecked={advertisement.status}
                      onChange={(evt) =>
                        onUpdate({
                          ...advertisement,
                          status: evt.target.checked,
                        })
                      }
                    />
                  </Td>
                  <Td>
                    <Tooltip label={isRunning(advertisement)?.whyNot}>
                      {isRunning(advertisement).running ? "Yes" : "No"}
                    </Tooltip>
                  </Td>
                </Tr>
              ))}
          </Tbody>
          {advertisements && advertisements.length > 0 && (
            <TableCaption>These are your sweet webpages.</TableCaption>
          )}
        </Table>
      </TableContainer>
    </Box>
  );
};

Advertisements.auth = true;
export default Advertisements;
