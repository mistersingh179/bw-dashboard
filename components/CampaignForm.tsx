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
  Switch,
  Textarea,
  VStack,
} from "@chakra-ui/react";
import React, { ChangeEvent, useState } from "react";
import { addDays, formatISO } from "date-fns";
import { CampaignType } from "@/types/my-types";
import {
  animals,
  colors,
  languages,
  names,
  starWars,
  uniqueNamesGenerator,
} from "unique-names-generator";

type CampaignFormProps = {
  submitHandler: (input: CampaignType) => void;
  campaign?: CampaignType;
};

const uniqueNameConfig = {
  dictionaries: [colors, animals],
  separator: "-",
};

const CampaignForm = (props: CampaignFormProps) => {
  const { campaign, submitHandler } = props;

  const tempName = uniqueNamesGenerator(uniqueNameConfig);
  const now = new Date();

  const defaultInputs = campaign
    ? campaign
    : {
        name: tempName,
        start: formatISO(now, { representation: "date" }),
        end: formatISO(addDays(now, 7), { representation: "date" }),
        impressionCap: 1_000_000,
        fixedCpm: 10,
        brandName: "Acme Corp",
        brandDescription:
          "Acme Corporation is a fictional corporation that features prominently in the Road Runner/Wile E. Coyote animated shorts as a running gag. The company manufactures outlandish products.",
        clickUrl: `https://en.wikipedia.org/wiki/Acme_Corporation?utm_campaign=${tempName}&utm_source=brandweaver.ai`,
        requiredCssSelector: "",
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
    brandName,
    brandDescription,
    clickUrl,
    requiredCssSelector,
    status,
    pacing,
  } = inputs;

  const buttonClickHandler = () => {
    submitHandler(inputs);
  };

  const setSwitchInput = (
    inputName: string,
    evt: ChangeEvent<HTMLInputElement>
  ) => {
    console.log(inputName, evt.target.checked);
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
    if(isNaN(valueAsNumber)){
      valueAsNumber = 0;
    }
    if(valueAsString === ""){
      valueAsString = "0";
    }
    console.log(inputName, valueAsNumber, valueAsString);
    setInputs((oldInputs) => ({
      ...oldInputs,
      [inputName]: valueAsNumber,
    }));
  };

  const setText = (
    inputName: string,
    evt: React.ChangeEvent<HTMLTextAreaElement>
  ) => {
    console.log(inputName, evt.target.value);
    setInputs((oldInputs) => ({
      ...oldInputs,
      [inputName]: evt.target.value,
    }));
  };

  const setInput = (
    inputName: string,
    evt: React.ChangeEvent<HTMLInputElement>
  ) => {
    console.log(inputName, evt.target.value);
    setInputs((oldInputs) => ({
      ...oldInputs,
      [inputName]: evt.target.value,
    }));
  };

  const nameMissing = name?.length === 0 ? true : false;
  const brandNameMissing = brandName?.length === 0 ? true : false;
  const brandDescriptionMissing = brandDescription?.length === 0 ? true : false;
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
          value={start}
          onChange={setInput.bind(this, "start")}
        />
        <FormHelperText>When to start this campaign</FormHelperText>
      </FormControl>
      <FormControl>
        <FormLabel>End Date</FormLabel>
        <Input type="date" value={end} onChange={setInput.bind(this, "end")} />
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
          value={fixedCpm}
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
      <FormControl isRequired isInvalid={brandNameMissing}>
        <FormLabel>Brand Name</FormLabel>
        <Input
          type="text"
          value={brandName}
          onChange={setInput.bind(this, "brandName")}
          placeholder={"Acme Corp."}
        />
        {brandNameMissing && (
          <FormErrorMessage>
            You must provide the name of the brand, this campaign is for.
          </FormErrorMessage>
        )}
        {!brandNameMissing && (
          <FormHelperText>
            This is the name of the brand you are advertising like Target,
            Apple, Microsoft etc.
          </FormHelperText>
        )}
      </FormControl>
      <FormControl isRequired isInvalid={brandDescriptionMissing}>
        <FormLabel>Brand Description</FormLabel>
        <Textarea
          value={brandDescription}
          onChange={setText.bind(this, "brandDescription")}
          placeholder={brandDescription}
        />
        {brandDescriptionMissing && (
          <FormErrorMessage>
            You must provide the description of the brand.
          </FormErrorMessage>
        )}
        {!brandDescriptionMissing && (
          <FormHelperText>
            This is the meta description of the brand you are advertising.
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
        <FormLabel>CSS Selector</FormLabel>
        <Input
          type={"text"}
          value={requiredCssSelector}
          onChange={setInput.bind(this, "requiredCssSelector")}
        />
        <FormHelperText>
          This is an optional field. If provided it will limit the campaign to
          run only on pages which have the provided css Selector
        </FormHelperText>
        <FormHelperText>
          e.g. {`[meta-category="fashion"]`} will run the campaign only on pages
          which have been categorized as fashion articles.
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
