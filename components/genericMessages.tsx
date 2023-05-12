import {
  Alert,
  AlertDescription,
  AlertIcon,
  AlertTitle,
  Progress,
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
    <Alert status="error" justifyContent={"center"}>
      <AlertIcon />
      <AlertTitle>{title}</AlertTitle>
      <AlertDescription>{description}</AlertDescription>
    </Alert>
  );
};

export const WarningAlert = ({
  showIcon = true,
  title = "No Data",
  description = "It seems like there is nothing to look here :-|",
}: {
  showIcon?: boolean
  title?: string;
  description?: string;
}): ReactElement => {
  return (<Alert status="warning" justifyContent={"center"}>
    {showIcon && <AlertIcon />}
    <AlertTitle>{title}</AlertTitle>
    <AlertDescription>{description}</AlertDescription>
  </Alert>)
};

export const ErrorRow = ({ colSpan }: { colSpan: number }) => {
  return (
    <Tr>
      <Td colSpan={colSpan} textAlign={"center"}>
        <ErrorAlert />
      </Td>
    </Tr>
  );
};

export const NoDataRow = ({ colSpan }: { colSpan: number }) => {
  return (
    <Tr>
      <Td colSpan={colSpan} textAlign={"center"}>
        <WarningAlert />
      </Td>
    </Tr>
  );
};

export const LoadingDataRow = ({ colSpan, height='auto' }: { colSpan: number, height?: string }) => {
  return (
    <Tr height={height}>
      <Td colSpan={colSpan} textAlign={"center"}>
        <Spinner color={"blue.500"} />
      </Td>
    </Tr>
  );
};
