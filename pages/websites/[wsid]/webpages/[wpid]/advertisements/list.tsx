import FCWithAuth from "@/types/FCWithAuth";
import {
  Box,
  Heading,
  HStack,
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
import { format } from "date-fns";
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

  // const { success, info, failure } = useTxToast();

  // const handleThumbsUp = (aid: string, status: boolean) => {
  //   success("Advertisement", "Upvote recorded.");
  //   onStatusUpdate(aid, status);
  // };
  // const handleThumbsDown = (aid: string, status: boolean) => {
  //   info("Advertisement", "Downvote recorded.");
  //   onStatusUpdate(aid, status);
  // };

  return (
    <Box>
      <HStack alignItems={"baseline"} my={5}>
        <Heading>Advertisements</Heading>
        {webpage && (
          <Heading color={"gray.400"} size={"sm"}>
            <Link href={`/websites/${wsid}/webpages/${wpid}/show`}>
              {" "}
              – {webpage.url}{" "}
            </Link>
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
                  {/*<Td>*/}
                  {/*  <Tooltip*/}
                  {/*    label={*/}
                  {/*      "Train & Personalize the AI model by providing feedback."*/}
                  {/*    }*/}
                  {/*  >*/}
                  {/*    <HStack spacing={2}>*/}
                  {/*      <IconButton*/}
                  {/*        onClick={handleThumbsUp.bind(*/}
                  {/*          this,*/}
                  {/*          advertisement.id,*/}
                  {/*          true*/}
                  {/*        )}*/}
                  {/*        aria-label={"thumbs-up"}*/}
                  {/*        variant={"outline"}*/}
                  {/*        icon={<IoThumbsUpOutline />}*/}
                  {/*      />*/}
                  {/*      <IconButton*/}
                  {/*        onClick={handleThumbsDown.bind(*/}
                  {/*          this,*/}
                  {/*          advertisement.id,*/}
                  {/*          false*/}
                  {/*        )}*/}
                  {/*        aria-label={"thumbs-down"}*/}
                  {/*        variant={"outline"}*/}
                  {/*        icon={<IoThumbsDownOutline />}*/}
                  {/*      />*/}
                  {/*    </HStack>*/}
                  {/*  </Tooltip>*/}
                  {/*</Td>*/}
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
