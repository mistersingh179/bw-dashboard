import {
  Box,
  Button,
  Heading,
  HStack,
  Spacer,
  Switch,
  Table,
  TableCaption,
  TableContainer,
  Tbody,
  Td,
  Th,
  Thead,
  Tr,
  useDisclosure,
} from "@chakra-ui/react";
import { AddIcon } from "@chakra-ui/icons";
import React, { useState } from "react";
import {
  ErrorRow,
  LoadingDataRow,
  NoDataRow,
} from "@/components/genericMessages";
import { NullableWebsiteType, WebsiteType } from "@/types/my-types";
import CreateWebsiteModal from "@/components/modals/CreateWebsiteModal";
import useWebsites from "@/hooks/useWebsites";
import { Link } from "@chakra-ui/next-js";
import EditWebsiteModal from "@/components/modals/EditWebsiteModal";
import fetcher from "@/helpers/fetcher";
import { preload } from "swr";
import useCategories from "@/hooks/useCategories";
import {CategoryWithCounts} from "@/pages/api/categories";

const Categories = () => {
  const {categories, isLoading, error} = useCategories();

  return (
    <Box>

      <HStack>
        <Heading my={5}>Categories</Heading>
      </HStack>
      <TableContainer whiteSpace={'normal'}>
        <Table variant="simple" colorScheme="gray" size={"md"}>
          <Thead>
            <Tr>
              <Th>Name</Th>
              <Th>Webpages Count</Th>
              <Th>Campaigns Count</Th>
            </Tr>
          </Thead>
          <Tbody>
            {error && <ErrorRow colSpan={4} />}
            {isLoading && <LoadingDataRow colSpan={4} />}
            {!isLoading && categories && categories.length == 0 && <NoDataRow colSpan={4} />}
            {categories &&
              categories.length > 0 &&
              categories.map((category) => (
                <Tr key={category.id ?? JSON.stringify(category)}>
                  <Td>{category.name}</Td>
                  <Td>{category._count.webpages}</Td>
                  <Td>{category._count.campaigns}</Td>
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
