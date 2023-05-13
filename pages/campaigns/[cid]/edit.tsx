import React from "react";
import { useRouter } from "next/router";

import { Box, Heading, Spinner } from "@chakra-ui/react";
import FCWithAuth from "@/types/FCWithAuth";
import { Link } from "@chakra-ui/next-js";
import useSWR, { mutate } from "swr";
import { QueryParams } from "@/types/QueryParams";
import fetcher from "@/helpers/fetcher";
import CampaignForm, { CategoryOptionType } from "@/components/CampaignForm";
import { CampaignType } from "@/types/my-types";
import useTxToast from "@/hooks/useTxToast";
import superjson from "superjson";
import useCategoriesOfCampaign from "@/hooks/useCategoriesOfCampaign";

const now = new Date();

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

const CampaignBox = (props: { campaign: CampaignType }) => {
  const router = useRouter();
  const { cid } = router.query as QueryParams;

  const { success, failure } = useTxToast();
  const { campaign } = props;

  const { categories: campaignCategories, onSave: onSaveCampaignCategories } =
    useCategoriesOfCampaign(cid);

  const submitHandler = async (
    campaign: CampaignType,
    selectedCategoryOptions: CategoryOptionType[]
  ) => {
    const { start, end, name, id } = campaign;
    console.log("in submit of edit: ", campaign);

    try {
      await mutate(`/api/campaigns`, editCampaign.bind(this, campaign), {
        optimisticData: (currentData: CampaignType[]) => {
          console.log("optimistic Data funcion called with: ", currentData);
          const idx = currentData.findIndex((x) => x.id === campaign.id);
          success("Campaign", "Edited successfully");
          return [
            ...currentData.slice(0, idx),
            { ...campaign },
            ...currentData.slice(idx + 1),
          ];
        },
        populateCache: false,
      });
    } catch (err) {
      console.log("the campaign edit mutation failed");
      failure("Campaign", "Rolling back as campaign edit failed!");
    }
    await mutate(`/api/campaigns/${id}`, campaign);

    const categoryIds = selectedCategoryOptions.map((c) => c.value);
    await onSaveCampaignCategories(categoryIds);
  };

  const editCampaign = async (campaign: CampaignType) => {
    console.log("in edit with: ", campaign);
    const res = await fetch(`/api/campaigns/${campaign.id}`, {
      method: "PUT",
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
      console.log("got updated campaign: ", data);
      return data;
    }
  };

  return <CampaignForm campaign={campaign} submitHandler={submitHandler} />;
};

const EditCampaign: FCWithAuth = () => {
  const router = useRouter();

  const { cid } = router.query as QueryParams;

  const {
    data: campaign,
    error,
    isLoading,
  } = useSWR<CampaignType>(cid ? `/api/campaigns/${cid}` : null, fetcher);

  return (
    <Box>
      <Heading my={5}>Campaign Edit</Heading>
      {isLoading && <LoadingBox />}
      {error && <ErrorBox />}
      {campaign && <CampaignBox campaign={campaign} />}
      <Box mt={5}>
        <Link href={"/campaigns/list"} colorScheme={"green"}>
          Go to All Campaigns
        </Link>
      </Box>
    </Box>
  );
};

EditCampaign.auth = true;

export default EditCampaign;
