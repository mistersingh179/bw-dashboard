import {
  Box,
  Heading,
  HStack,
  Switch,
  Table,
  TableCaption,
  TableContainer,
  Tbody,
  Td,
  Th,
  Thead,
  Tooltip,
  Tr,
} from "@chakra-ui/react";
import React from "react";
import {
  ErrorRow,
  LoadingDataRow,
  NoDataRow,
} from "@/components/genericMessages";
import useCategories from "@/hooks/useCategories";

const Categories = () => {
  const { categories, isLoading, error, onUpdate } = useCategories();

  return (
    <Box>
      <HStack>
        <Heading my={5}>Categories</Heading>
      </HStack>
      <TableContainer whiteSpace={"normal"}>
        <Table variant="simple" colorScheme="gray" size={"md"}>
          <Thead>
            <Tr>
              <Th>Name</Th>
              <Th>Webpages Count</Th>
              <Th>Campaigns Count</Th>
              <Th>
                <Tooltip
                  label={
                    "Toggling this will make bw.js script abort execution " +
                    "when on pages which have the corresponding category."
                  }
                >
                  Abort Script
                </Tooltip>
              </Th>
            </Tr>
          </Thead>
          <Tbody>
            {error && <ErrorRow colSpan={4} />}
            {isLoading && <LoadingDataRow colSpan={4} />}
            {!isLoading && categories && categories.length == 0 && (
              <NoDataRow colSpan={4} />
            )}
            {categories &&
              categories.length > 0 &&
              categories.map((category) => (
                <Tr key={category.id ?? JSON.stringify(category)}>
                  <Td>{category.name}</Td>
                  <Td>{category._count.webpages}</Td>
                  <Td>{category._count.campaigns}</Td>
                  <Td>
                    <Switch
                      colorScheme={"red"}
                      isChecked={category.abortScript}
                      isDisabled={category.id ? false : true}
                      onChange={(evt) =>
                        onUpdate({
                          ...category,
                          abortScript: evt.target.checked,
                        })
                      }
                    />
                  </Td>
                </Tr>
              ))}
          </Tbody>
          {categories && categories.length > 0 && (
            <TableCaption>These are your sweet categories.</TableCaption>
          )}
        </Table>
      </TableContainer>
    </Box>
  );
};

export default Categories;
