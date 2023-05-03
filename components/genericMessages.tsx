import {
  Alert,
  AlertDescription,
  AlertIcon,
  AlertTitle, Progress,
  Spinner,
  Td,
  Tr,
} from "@chakra-ui/react";
import { Link } from "@chakra-ui/next-js";
import React, { ReactElement } from "react";

export const AnimatedProgressBar = () => {
  return <Progress size="xs" isIndeterminate />;
};
export const ErrorAlert = ({
  title = "Error",
  description = "An error has occurred, perhaps retry?",
}: {
  title?: string;
  description?: string;
}): ReactElement => {
  return (
    <Alert status="error">
      <AlertIcon />
      <AlertTitle>{title}</AlertTitle>
      <AlertDescription>{description}</AlertDescription>
    </Alert>
  );
};

export const ErrorRow = ({ colSpan }: { colSpan: number }) => {
  return (
    <Tr>
      <Td colSpan={colSpan} textAlign={"center"}>
        There was an error processing your request. Try again?
      </Td>
    </Tr>
  );
};

export const NoDataRow = ({ colSpan }: { colSpan: number }) => {
  return (
    <Tr>
      <Td colSpan={colSpan} textAlign={"center"}>
        No data, thus nothing to look here :-|
      </Td>
    </Tr>
  );
};

export const LoadingDataRow = ({ colSpan }: { colSpan: number }) => {
  return (
    <Tr>
      <Td colSpan={colSpan} textAlign={"center"}>
        <Spinner color={"blue.500"} />
      </Td>
    </Tr>
  );
};
