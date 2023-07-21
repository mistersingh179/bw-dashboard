import React from "react";
import { useRouter } from "next/router";

import { Box, Heading, HStack, Spinner, Tag, VStack } from "@chakra-ui/react";
import FCWithAuth from "@/types/FCWithAuth";
import { Link } from "@chakra-ui/next-js";
import useSWR from "swr";
import { QueryParams } from "@/types/QueryParams";
import fetcher from "@/helpers/fetcher";
import { formatISO } from "date-fns";
import { CampaignType, CategoryType } from "@/types/my-types";
import StatusBadge from "@/components/StatusBadge";
import numeral from "numeral";
import { ExternalLinkIcon } from "@chakra-ui/icons";
import { WarningAlert } from "@/components/genericMessages";
import useCategoriesOfCampaign from "@/hooks/useCategoriesOfCampaign";
import useCampWithImpCount from "@/hooks/useCampWithImpCount";

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

const CampaignBox = ({
  campaign,
  campaignCategories,
  isLoadingCampaignCategories,
  campsWithImpCount,
  isLoadingCampWithImpCount,
}: {
  campaign: CampaignType;
  campaignCategories?: CategoryType[];
  isLoadingCampaignCategories: boolean;
  campsWithImpCount: { [key: string]: number };
  isLoadingCampWithImpCount: boolean;
}) => {
  console.log("in campaignBox with: ", campaign);
  return (
    <VStack alignItems={"start"}>
      <HStack>
        <Box minW={"3xs"}>Id: </Box>
        <Box>{campaign.id}</Box>
      </HStack>
      <HStack>
        <Box minW={"3xs"}>Name: </Box>
        <Box>{campaign.name}</Box>
      </HStack>
      <HStack>
        <Box minW={"3xs"}>Start: </Box>
        <Box>{formatISO(campaign.start, { representation: "date" })}</Box>
      </HStack>
      <HStack>
        <Box minW={"3xs"}>End: </Box>
        <Box>{formatISO(campaign.end, { representation: "date" })}</Box>
      </HStack>
      <HStack>
        <Box minW={"3xs"}>Impression Cap: </Box>
        <Box>{numeral(campaign.impressionCap).format("0,0")}</Box>
      </HStack>
      <HStack>
        <Box minW={"3xs"}>Impressions Delivered: </Box>
        {isLoadingCampWithImpCount && <Spinner />}
        {!isLoadingCampWithImpCount && campaign && campsWithImpCount && (
          <Box>{numeral(campsWithImpCount[campaign?.id ?? ""]).format("0,0")}</Box>
        )}
      </HStack>
      <HStack>
        <Box minW={"3xs"}>Fixed CPM: </Box>
        <Box>{numeral(campaign.fixedCpm).format("$0.0[.]00")}</Box>
      </HStack>
      <HStack>
        <Box minW={"3xs"}>Status: </Box>
        <Box>
          <StatusBadge status={campaign.status} />
        </Box>
      </HStack>
      <HStack>
        <Box minW={"3xs"}>Product Name: </Box>
        <Box>{campaign.productName}</Box>
      </HStack>
      <HStack>
        <Box minW={"3xs"}>Poduct Description: </Box>
        <Box>{campaign.productDescription}</Box>
      </HStack>
      <HStack>
        <Box minW={"3xs"}>Click Url: </Box>
        <Box>
          <Link href={campaign.clickUrl} target={"_blank"}>
            {campaign.clickUrl} <ExternalLinkIcon mx="2px" />
          </Link>
        </Box>
      </HStack>
      <HStack>
        <Box minW={"3xs"}>CSS Selector: </Box>
        <Box>{campaign.requiredCssSelector || "--Not Provided--"}</Box>
      </HStack>
      <HStack>
        <Box minW={"3xs"}>Pacing: </Box>
        <Box>
          <StatusBadge status={campaign.pacing} />
        </Box>
      </HStack>
      <HStack>
        <Box minW={"3xs"}>Categories: </Box>
        <Box>
          {isLoadingCampaignCategories && <Spinner color={"blue.500"} />}
          {!isLoadingCampaignCategories &&
            campaignCategories &&
            campaignCategories.length == 0 && (
              <WarningAlert
                showIcon={false}
                title={""}
                description={"None Found"}
              />
            )}
          {!isLoadingCampaignCategories &&
            campaignCategories &&
            campaignCategories.length > 0 && (
              <HStack>
                {campaignCategories.map((c) => (
                  <Tag key={c.id}>{c.name}</Tag>
                ))}
              </HStack>
            )}
        </Box>
      </HStack>
    </VStack>
  );
};

const ShowCampaign: FCWithAuth = () => {
  const router = useRouter();
  const { cid } = router.query as QueryParams;

  const {
    data: campaign,
    error,
    isLoading,
  } = useSWR<CampaignType>(cid ? `/api/campaigns/${cid}` : null, fetcher);

  const {
    categories: campaignCategories,
    isLoading: isLoadingCampaignCategories,
  } = useCategoriesOfCampaign(cid);

  const {
    campsWithImpCount,
    isLoading: isLoadingCampWithImpCount,
    error: errorCampWithImpCount,
  } = useCampWithImpCount();

  return (
    <Box>
      <Heading my={5}>Campaign Details</Heading>
      {isLoading && <LoadingBox />}
      {error && <ErrorBox />}
      {campaign && (
        <CampaignBox
          campaign={campaign}
          campaignCategories={campaignCategories}
          isLoadingCampaignCategories={isLoadingCampaignCategories}
          campsWithImpCount={campsWithImpCount}
          isLoadingCampWithImpCount={isLoadingCampWithImpCount}
        />
      )}
      {!isLoading && !campaign && <WarningAlert />}
      <Box mt={5}>
        <Link href={"/campaigns/list"} colorScheme={"green"}>
          Go to All Campaigns
        </Link>
      </Box>
    </Box>
  );
};

ShowCampaign.auth = true;

export default ShowCampaign;
