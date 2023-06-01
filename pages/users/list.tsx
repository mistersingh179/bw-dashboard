import {
  Box,
  Button,
  ButtonGroup,
  Heading,
  HStack,
  IconButton,
  ListItem,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  Table,
  TableCaption,
  TableContainer,
  Tbody,
  Td,
  Th,
  Thead,
  Tr,
  UnorderedList,
} from "@chakra-ui/react";
import React from "react";
import {
  ErrorRow,
  LoadingDataRow,
  NoDataRow,
} from "@/components/genericMessages";
import useUsers, { UserWithCounts } from "@/hooks/useUsers";
import {AddIcon, ArrowDownIcon, ChevronDownIcon, HamburgerIcon, StarIcon} from "@chakra-ui/icons";

const Users = () => {
  const { users, isLoading, error } = useUsers();

  return (
    <Box>
      <HStack>
        <Heading my={5}>Users</Heading>
      </HStack>
      <TableContainer whiteSpace={"normal"}>
        <Table variant="simple" colorScheme="gray" size={"md"}>
          <Thead>
            <Tr>
              <Th>Name</Th>
              <Th>Email</Th>
              <Th>Counts</Th>
              <Th>Actions</Th>
            </Tr>
          </Thead>
          <Tbody>
            {error && <ErrorRow colSpan={3} />}
            {isLoading && <LoadingDataRow colSpan={3} />}
            {!isLoading && users && users.length == 0 && (
              <NoDataRow colSpan={3} />
            )}
            {users &&
              users.length > 0 &&
              users.map((user: UserWithCounts) => (
                <Tr key={user.id ?? JSON.stringify(user)}>
                  <Td>{user.name}</Td>
                  <Td>{user.email}</Td>
                  <Td>
                    <UnorderedList>
                      <ListItem>Campaigns: {user._count.campaigns}</ListItem>
                      <ListItem>Websites: {user._count.websites}</ListItem>
                      <ListItem>Categories: {user._count.categories}</ListItem>
                    </UnorderedList>
                  </Td>
                  <Td>
                    <ButtonGroup size='md' isAttached colorScheme={'blue'} variant='outline'>
                      <Button>Impersonate</Button>
                      <Menu>
                        <MenuButton
                          as={IconButton}
                          icon={<ChevronDownIcon />}
                        >
                          Actions
                        </MenuButton>
                        <MenuList>
                          <MenuItem>foo bar baaz</MenuItem>
                          <MenuItem>lorem</MenuItem>
                          <MenuItem>lorem lipsum</MenuItem>
                          <MenuItem>foo bar</MenuItem>
                        </MenuList>
                      </Menu>
                    </ButtonGroup>
                  </Td>
                </Tr>
              ))}
          </Tbody>
          {users && users.length > 0 && (
            <TableCaption>These are your sweet users.</TableCaption>
          )}
        </Table>
      </TableContainer>
    </Box>
  );
};

export default Users;
