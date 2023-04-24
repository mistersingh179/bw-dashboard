import { Spinner, Td, Tr } from "@chakra-ui/react";
import { Link } from "@chakra-ui/next-js";
import React from "react";

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
