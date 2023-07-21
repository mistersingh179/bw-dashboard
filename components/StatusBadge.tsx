import { Badge } from "@chakra-ui/react";
import React from "react";

const StatusBadge = ({
  status,
  py = 1,
  words = ["ON", "OFF"],
}: {
  status: boolean;
  py?: number;
  words?: string[];
}) => {
  return (
    <Badge
      fontSize={"1em"}
      py={py}
      borderRadius={"md"}
      size={"lg"}
      variant={"subtle"}
      colorScheme={status ? "green" : "red"}
    >
      {status ? words[0] : words[1]}
    </Badge>
  );
};

export default StatusBadge;
