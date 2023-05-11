import { Button, HStack, Spacer, Td, Text, Tr } from "@chakra-ui/react";
import React, {Dispatch, SetStateAction} from "react";

const PaginationRow = ({
  page,
  setPage,
  colSpan,
  onMouseOverFn,
}: {
  page: number;
  setPage: Dispatch<SetStateAction<number>>;
  colSpan: number;
  onMouseOverFn? : Function
}) => {
  return (
    <Tr onMouseOver={() => onMouseOverFn ? onMouseOverFn() : null}>
      <Td colSpan={colSpan}>
        <HStack>
          <Text color={"gray.600"} fontSize={"sm"}>
            Page # {page}
          </Text>
          <Spacer />
          <Button
            isDisabled={page === 1}
            variant={"outline"}
            onClick={() => setPage((pv) => (pv > 1 ? pv - 1 : pv))}
          >
            Previous
          </Button>
          <Button variant={"outline"} onClick={() => setPage((pv) => pv + 1)}>
            Next
          </Button>
        </HStack>
      </Td>
    </Tr>
  );
};

export default PaginationRow;
