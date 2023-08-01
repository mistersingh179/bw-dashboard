import {
  Button,
  FormControl,
  FormErrorMessage,
  FormHelperText,
  FormLabel,
  Input,
  NumberDecrementStepper,
  NumberIncrementStepper,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  Spinner,
  Switch,
  Textarea,
  VStack,
} from "@chakra-ui/react";
import { Select } from "chakra-react-select";
import React, { ChangeEvent, useEffect, useState } from "react";
import { addDays, format, parse } from "date-fns";
import { CampaignType } from "@/types/my-types";
import { animals, colors, uniqueNamesGenerator } from "unique-names-generator";
import useCategories from "@/hooks/useCategories";
import useCategoriesOfCampaign from "@/hooks/useCategoriesOfCampaign";

export type CategoryOptionType = {
  label: string;
  value: string;
};

type CampaignFormProps = {
  submitHandler: (
    input: CampaignType,
    selectedCategoryOptions: CategoryOptionType[]
  ) => void;
  campaign?: CampaignType;
};

const uniqueNameConfig = {
  dictionaries: [colors, animals],
  separator: "-",
};

const CampaignForm = (props: CampaignFormProps) => {
  const { campaign, submitHandler } = props;

  const { categories: allCategories, isLoading: isLoadingAllCategories } =
    useCategories();
  const allCategoryOptions: CategoryOptionType[] = allCategories
    ? allCategories.map((c) => ({
        value: c.id,
        label: c.name,
      }))
    : [];

  const {
    categories: campaignCategories,
    isLoading: isLoadingCampaignCategories,
  } = useCategoriesOfCampaign(campaign?.id);

  const showSpinnerForCategoriesSelect = () => {
    if (isLoadingAllCategories) {
      return true;
    } else if (campaign?.id && isLoadingCampaignCategories) {
      return true;
    } else {
      return false;
    }
  };

  const weHaveCategoriesData = () => {
    if (campaign?.id) {
      return Boolean(allCategories) && Boolean(campaignCategories);
    } else {
      return Boolean(allCategories);
    }
  };

  const [selectedCategoryOptions, setSelectedCategoryOptions] = useState<
    CategoryOptionType[]
  >([]);

  useEffect(() => {
    if (campaignCategories) {
      console.log(
        "*** got new campaignCategories, will update state: ",
        campaignCategories
      );
      const campaignCategoryOptions: CategoryOptionType[] =
        campaignCategories.map((c) => ({
          value: c.id ? c.id : "",
          label: c.name,
        }));
      setSelectedCategoryOptions(campaignCategoryOptions);
    }
  }, [campaignCategories]);

  const tempName = uniqueNamesGenerator(uniqueNameConfig);
  const now = new Date();

  const defaultInputs = campaign
    ? campaign
    : {
        name: tempName,
        start: now,
        end: addDays(now, 7),
        impressionCap: 1_000_000,
        fixedCpm: 10,
        productName: "Acme Corp",
        productDescription:
          "Acme Corporation is a fictional corporation that features prominently in the Road Runner/Wile E. Coyote animated shorts as a running gag. The company manufactures outlandish products.",
        clickUrl: `https://en.wikipedia.org/wiki/Acme_Corporation?utm_campaign=${tempName}&utm_source=brandweaver.ai`,
        creativeUrl: '',
        pacing: false,
        status: true,
      };

  const [inputs, setInputs] = useState(defaultInputs);

  const {
    name,
    start,
    end,
    impressionCap,
    fixedCpm,
    productName,
    productDescription,
    clickUrl,
    creativeUrl,
    status,
    pacing,
  } = inputs;

  const buttonClickHandler = () => {
    submitHandler(inputs, selectedCategoryOptions);
  };

  const setSwitchInput = (
    inputName: string,
    evt: ChangeEvent<HTMLInputElement>
  ) => {
    console.log("in setSwitchInput with: ", inputName, evt.target.checked);
    setInputs((oldInputs) => ({
      ...oldInputs,
      [inputName]: evt.target.checked,
    }));
  };

  const setNumberInput = (
    inputName: string,
    valueAsString: string,
    valueAsNumber: number
  ) => {
    if (isNaN(valueAsNumber)) {
      valueAsNumber = 0;
    }
    if (valueAsString === "") {
      valueAsString = "0";
    }
    console.log(
      "in setNumberInput with: ",
      inputName,
      valueAsNumber,
      valueAsString
    );
    setInputs((oldInputs) => ({
      ...oldInputs,
      [inputName]: valueAsNumber,
    }));
  };

  const setDate = (
    inputName: string,
    evt: React.ChangeEvent<HTMLInputElement>
  ) => {
    console.log(
      "***in setDate with: ",
      inputName,
      evt.target.value,
      evt.target.value === ""
    );
    if (evt.target.value === "") {
      setInputs((oldInputs) => ({
        ...oldInputs,
        [inputName]: undefined,
      }));
    } else {
      const dateObj = parse(evt.target.value, "yyyy-MM-dd", new Date());
      setInputs((oldInputs) => ({
        ...oldInputs,
        [inputName]: dateObj,
      }));
    }
  };

  const setText = (
    inputName: string,
    evt: React.ChangeEvent<HTMLTextAreaElement>
  ) => {
    console.log("in setText with: ", inputName, evt.target.value);
    setInputs((oldInputs) => ({
      ...oldInputs,
      [inputName]: evt.target.value,
    }));
  };

  const setInput = (
    inputName: string,
    evt: React.ChangeEvent<HTMLInputElement>
  ) => {
    console.log("in setInput with: ", inputName, evt.target.value);
    setInputs((oldInputs) => ({
      ...oldInputs,
      [inputName]: evt.target.value,
    }));
  };

  const nameMissing = name?.length === 0 ? true : false;
  const productNameMissing = productName?.length === 0 ? true : false;
  const productDescriptionMissing =
    productDescription?.length === 0 ? true : false;
  const clickUrlMissing = clickUrl?.length === 0 ? true : false;

  return (
    <VStack spacing={5}>
      <FormControl isRequired isInvalid={nameMissing}>
        <FormLabel>Name</FormLabel>
        <Input
          type="text"
          value={name}
          onChange={setInput.bind(this, "name")}
          placeholder={"My First Campaign"}
        />
        {nameMissing && (
          <FormErrorMessage>
            A name is required so you can remember this campaign
          </FormErrorMessage>
        )}
        {!nameMissing && (
          <FormHelperText>
            A friendly name to remember your campaign.
          </FormHelperText>
        )}
      </FormControl>
      <FormControl>
        <FormLabel>Start Date</FormLabel>
        <Input
          type="date"
          value={start ? format(start, "yyyy-MM-dd") : undefined}
          onChange={setDate.bind(this, "start")}
        />
        <FormHelperText>When to start this campaign</FormHelperText>
      </FormControl>
      <FormControl>
        <FormLabel>End Date</FormLabel>
        <Input
          type="date"
          value={end ? format(end, "yyyy-MM-dd") : undefined}
          onChange={setDate.bind(this, "end")}
        />
        <FormHelperText>When to stop this campaign</FormHelperText>
      </FormControl>
      <FormControl>
        <FormLabel>Impression Cap</FormLabel>
        <NumberInput
          min={0}
          max={1_000_000_000_000}
          step={10_000}
          value={impressionCap}
          onChange={setNumberInput.bind(this, "impressionCap")}
        >
          <NumberInputField />
          <NumberInputStepper>
            <NumberIncrementStepper />
            <NumberDecrementStepper />
          </NumberInputStepper>
        </NumberInput>
        <FormHelperText>
          The maximum number of impressions you want to deliver in this campaign
        </FormHelperText>
      </FormControl>
      <FormControl>
        <FormLabel>Fixed CPM</FormLabel>
        <NumberInput
          min={0}
          max={1_000}
          step={1}
          value={fixedCpm ? Number(fixedCpm) : 0}
          onChange={setNumberInput.bind(this, "fixedCpm")}
        >
          <NumberInputField />
          <NumberInputStepper>
            <NumberIncrementStepper />
            <NumberDecrementStepper />
          </NumberInputStepper>
        </NumberInput>
        <FormHelperText>
          The maximum number of impressions you want to deliver in this campaign
        </FormHelperText>
      </FormControl>
      <FormControl isRequired isInvalid={productNameMissing}>
        <FormLabel>Product Name</FormLabel>
        <Input
          type="text"
          value={productName}
          onChange={setInput.bind(this, "productName")}
          placeholder={"Acme Corp."}
          disabled={campaign ? true : false}
        />
        {productNameMissing && (
          <FormErrorMessage>
            You must provide the name of the product, this campaign is for.
          </FormErrorMessage>
        )}
        {!productNameMissing && (
          <FormHelperText>
            This is the name of the product you are advertising like Target,
            Apple, Microsoft etc.
          </FormHelperText>
        )}
      </FormControl>
      <FormControl isRequired isInvalid={productDescriptionMissing}>
        <FormLabel>Product Description</FormLabel>
        <Textarea
          value={productDescription}
          onChange={setText.bind(this, "productDescription")}
          placeholder={productDescription}
          disabled={campaign ? true : false}
        />
        {productDescriptionMissing && (
          <FormErrorMessage>
            You must provide the description of the product.
          </FormErrorMessage>
        )}
        {!productDescriptionMissing && (
          <FormHelperText>
            This is the meta description of the product you are advertising.
          </FormHelperText>
        )}
      </FormControl>
      <FormControl isRequired isInvalid={clickUrlMissing}>
        <FormLabel>Click Url</FormLabel>
        <Input
          type={"text"}
          value={clickUrl}
          onChange={setInput.bind(this, "clickUrl")}
          placeholder={clickUrl}
        />
        {clickUrlMissing && (
          <FormErrorMessage>
            You must provide the Click URL for this campaign.
          </FormErrorMessage>
        )}
        {!clickUrlMissing && (
          <FormHelperText>
            This is the click url with your utm params for the campaign.
          </FormHelperText>
        )}
      </FormControl>
      <FormControl>
        <FormLabel>Creative Url</FormLabel>
        <Input
          type={"text"}
          value={creativeUrl ?? ""}
          onChange={setInput.bind(this, "creativeUrl")}
          placeholder={creativeUrl ?? ""}
        />
        <FormHelperText>
          An Experimental Field to store the image url which is used instead of
          text generated ad.
        </FormHelperText>
      </FormControl>

      <FormControl>
        <FormLabel>Categories</FormLabel>
        {showSpinnerForCategoriesSelect() && <Spinner color={"blue.500"} />}
        {weHaveCategoriesData() && (
          <Select
            onChange={(newValue, actionMeta) => {
              setSelectedCategoryOptions([...newValue]);
            }}
            value={selectedCategoryOptions}
            isClearable={true}
            isSearchable={true}
            isMulti={true}
            useBasicStyles={true}
            selectedOptionStyle={"check"}
            options={allCategoryOptions}
          />
        )}
        <FormHelperText>
          Select the webpage categories you want this campaign to run on.
        </FormHelperText>
      </FormControl>
      <FormControl display={"flex"} alignItems={"center"}>
        <FormLabel mb={0}>Pacing</FormLabel>
        <Switch
          isChecked={inputs?.pacing}
          onChange={setSwitchInput.bind(this, "pacing")}
        />
      </FormControl>
      <FormControl display={"flex"} alignItems={"center"}>
        <FormLabel mb={0}>Status</FormLabel>
        <Switch
          isChecked={inputs?.status}
          onChange={setSwitchInput.bind(this, "status")}
        />
      </FormControl>
      <FormControl>
        <Button colorScheme="blue" onClick={buttonClickHandler}>
          Submit
        </Button>
      </FormControl>
    </VStack>
  );
};

export default CampaignForm;
