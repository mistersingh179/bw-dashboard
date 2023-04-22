import {
  Button,
  FormControl,
  FormHelperText,
  FormLabel,
  Input,
  VStack,
} from "@chakra-ui/react";
import React, { useState } from "react";
import { addDays, formatISO } from "date-fns";
import { CampaignType } from "@/types/campaign-types";

const now = new Date();

type InputEvent = React.ChangeEvent<HTMLInputElement>;
type ButtonEvent = React.MouseEvent<HTMLButtonElement>;

type CampaignFormProps = {
  submitHandler: (input: CampaignType) => void;
  campaign?: CampaignType;
};

const CampaignForm = (props: CampaignFormProps) => {
  const { campaign, submitHandler } = props;

  const defaultInputs = campaign
    ? campaign
    : {
        name: "super",
        start: formatISO(now, { representation: "date" }),
        end: formatISO(addDays(now, 7), { representation: "date" }),
      };

  const [inputs, setInputs] = useState(defaultInputs);

  const { name, start, end } = inputs;

  const buttonClickHandler = () => {
    submitHandler(inputs);
  };

  const setInput = (inputName: string, evt: InputEvent) => {
    console.log(inputName, evt.target.value);
    setInputs((oldInputs) => ({
      ...oldInputs,
      [inputName]: evt.target.value,
    }));
  };
  return (
    <VStack spacing={5}>
      <FormControl>
        <FormLabel>Name</FormLabel>
        <Input
          type="text"
          value={name}
          onChange={setInput.bind(this, "name")}
          placeholder={"My First Campaign"}
        />
        <FormHelperText>
          A friendly name to remember your campaign.
        </FormHelperText>
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
        <Button colorScheme="blue" onClick={buttonClickHandler}>
          Submit
        </Button>
      </FormControl>
    </VStack>
  );
};

export default CampaignForm;
