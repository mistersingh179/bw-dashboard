import {
  Box,
  Slider,
  SliderFilledTrack,
  SliderMark,
  SliderThumb,
  SliderTrack,
  Tooltip,
} from "@chakra-ui/react";
import React from "react";
import { MdSportsScore } from "react-icons/md";

const scoresLabel: { [key: number] : string } = {
  0: "no relevance",
  1: "slightly relevant",
  2: "relevant",
  3: "more relevant",
  4: "extremely relevant",
};

function SliderThumbWithTooltip({
  value,
  onChangeHandler,
}: {
  value: number;
  onChangeHandler: (newValue: number) => void;
}) {
  const [showTooltip, setShowTooltip] = React.useState(false);
  return (
    <Slider
      id="slider"
      value={value}
      min={0}
      max={4}
      colorScheme="blue"
      onChange={onChangeHandler}
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
    >
      <SliderMark value={0} mt="2" ml="0" fontSize="sm">
        0
      </SliderMark>
      <SliderMark value={1} mt="2" ml="-1.5" fontSize="sm">
        1
      </SliderMark>
      <SliderMark value={2} mt="2" ml="-1.5" fontSize="sm">
        2
      </SliderMark>
      <SliderMark value={3} mt="2" ml="-1.5" fontSize="sm">
        3
      </SliderMark>
      <SliderMark value={4} mt="2" ml="-1.5" fontSize="sm">
        4
      </SliderMark>
      <SliderTrack>
        <SliderFilledTrack />
      </SliderTrack>
      <Tooltip
        hasArrow
        bg="blue.500"
        color="white"
        placement="top"
        isOpen={showTooltip}
        label={`${scoresLabel[value]}`}
      >
        <SliderThumb w={5} h={5} bg={"gray.100"} />
      </Tooltip>
    </Slider>
  );
}

export default SliderThumbWithTooltip;
