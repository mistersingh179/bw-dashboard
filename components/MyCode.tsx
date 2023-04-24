import { Code } from "@chakra-ui/react";
import React, {ReactNode} from "react";

const MyCode = ({ children }: { children: ReactNode }) => {
  return (
    <Code
      _selection={{ color: "gray.800", bg: "orange.300" }}
      whiteSpace={"pre"}
      variant={"solid"}
      bg={"yellow.100"}
      color={"gray.700"}
      border={"1px"}
      borderColor={"gray.300"}
      boxShadow={"lg"}
      borderRadius={"lg"}
      p={1}
    >
      {children}
    </Code>
  );
};

export default MyCode