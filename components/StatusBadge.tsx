import {Badge} from "@chakra-ui/react";
import React from "react";

const StatusBadge = ({ status }: { status: boolean }) => {
  return (
    <Badge
      fontSize={"1em"}
      py={1}
      borderRadius={"md"}
      size={"lg"}
      variant={"subtle"}
      colorScheme={status ? "green" : "red"}
    >
      {status ? "ON" : "OFF"}
    </Badge>
  );
};

export default StatusBadge