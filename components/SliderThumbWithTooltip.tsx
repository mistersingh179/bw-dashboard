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
      max={100}
      colorScheme="blue"
      onChange={onChangeHandler}
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
    >
      <SliderMark value={0} mt="2" ml="0" fontSize="sm">
        0%
      </SliderMark>
      <SliderMark value={25} mt="2" ml="-2.5" fontSize="sm">
        25%
      </SliderMark>
      <SliderMark value={50} mt="2" ml="-2.5" fontSize="sm">
        50%
      </SliderMark>
      <SliderMark value={75} mt="2" ml="-2.5" fontSize="sm">
        75%
      </SliderMark>
      <SliderMark value={100} mt="2" ml="-8" fontSize="sm">
        100%
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
        label={`${value}%`}
      >
        <SliderThumb w={5} h={5} bg={"gray.100"} />
      </Tooltip>
    </Slider>
  );
}

export default SliderThumbWithTooltip;
