import {
  Button,
  FormControl,
  FormLabel,
  HStack,
  Select,
  Spacer,
  Td,
  Text,
  Tr,
} from "@chakra-ui/react";
import React, { Dispatch, SetStateAction } from "react";

const PaginationRow = ({
  page,
  setPage,
  pageSize,
  setPageSize,
  colSpan,
  onMouseOverFn,
  size = "md",
}: {
  page: number;
  setPage: Dispatch<SetStateAction<number>>;
  pageSize: number;
  setPageSize: Dispatch<SetStateAction<number>>;
  colSpan: number;
  onMouseOverFn?: Function;
  size?: "xs" | "sm" | "md" | "lg";
}) => {
  return (
    <Tr onMouseOver={() => (onMouseOverFn ? onMouseOverFn() : null)}>
      <Td colSpan={colSpan}>
        <HStack>
          <Text color={"gray.600"} fontSize={"sm"} width={"100px"}>
            Page # {page}
          </Text>
          <FormControl
            display={"flex"}
            alignItems={"baseline"}
            justifyContent={"start"}
          >
            <FormLabel color={"gray.600"} fontWeight={"normal"} fontSize={"sm"}>
              Items per page
            </FormLabel>
            <Select
              width={"100px"}
              size={"sm"}
              value={pageSize}
              onChange={(evt) => setPageSize(Number(evt.target.value))}
            >
              <option value={"5"}>5</option>
              <option value={"10"}>10</option>
              <option value={"25"}>25</option>
              <option value={"50"}>50</option>
              <option value={"100"}>100</option>
              <option value={"250"}>250</option>
              <option value={"500"}>500</option>
              <option value={"1000"}>1000</option>
            </Select>
          </FormControl>
          <Spacer />
          <Button
            size={size}
            isDisabled={page === 1}
            variant={"outline"}
            onClick={() => setPage((pv) => (pv > 1 ? pv - 1 : pv))}
          >
            Previous
          </Button>
          <Button
            size={size}
            variant={"outline"}
            onClick={() => setPage((pv) => pv + 1)}
          >
            Next
          </Button>
        </HStack>
      </Td>
    </Tr>
  );
};

export default PaginationRow;
