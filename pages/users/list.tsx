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
import {
  AddIcon,
  ArrowDownIcon,
  ChevronDownIcon,
  HamburgerIcon,
  StarIcon,
} from "@chakra-ui/icons";
import { signIn } from "next-auth/react";
import superjson from "superjson";
import useTxToast from "@/hooks/useTxToast";

const Users = () => {
  const { users, isLoading, error } = useUsers();
  const { success, failure } = useTxToast();
  const processUserHandler = async (id: string) => {
    const payload = {
      userIdToProcess: id,
    };
    const res = await fetch("/api/users/processUser", {
      method: "POST",
      body: JSON.stringify(payload),
      headers: {
        "Content-Type": "application/json",
      },
    });
    console.log("processUserHandler result: ", res.status, res.statusText);
    const text = await res.text();
    const data = superjson.parse<any>(text);
    if (res.status === 202) {
      success(
        "Process User",
        <Box>
          Job has been scheduled.
          <br />
          Job Id: {data.id}
        </Box>
      );
    } else {
      failure("Process User", `Job Scheduling Failed`);
    }
  };

  const impresonateHandler = async (id: string) => {
    const payload = {
      userIdToImpersonate: id,
    };
    const res = await fetch("/api/users/impersonate", {
      method: "POST",
      body: JSON.stringify(payload),
      headers: {
        "Content-Type": "application/json",
      },
    });
    console.log("impresonateHandler result: ", res.status, res.statusText);
    if (res.status === 204) {
      window.location.href = window.location.origin;
    }
  };

  const rebuildAdsHandler = async (id: string) => {
    const payload = {
      userIdToProcess: id,
    };
    const res = await fetch("/api/users/rebuildAds", {
      method: "POST",
      body: JSON.stringify(payload),
      headers: {
        "Content-Type": "application/json",
      },
    });
    console.log("rebuildAds result: ", res.status, res.statusText);
  };

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
                <Tr key={user.id}>
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
                    <ButtonGroup
                      size="md"
                      isAttached
                      colorScheme={"blue"}
                      variant="outline"
                    >
                      <Button
                        onClick={() => {
                          const ans = confirm(
                            `Are you sure you want to IMPERSONATE this user: ${user.email}`
                          );
                          if (ans) {
                            impresonateHandler(user.id);
                          }
                        }}
                      >
                        Impersonate
                      </Button>
                      <Menu>
                        <MenuButton as={IconButton} icon={<ChevronDownIcon />}>
                          Actions
                        </MenuButton>
                        <MenuList>
                          <MenuItem
                            onClick={() => {
                              const ans = confirm(
                                `Are you sure you want to PROCESS this user: ${user.email}`
                              );
                              if (ans) {
                                processUserHandler(user.id);
                              }
                            }}
                          >
                            Process User
                          </MenuItem>
                          <MenuItem
                            onClick={() => {
                              const ans = confirm(
                                `This will DELETE ALL ad spots and ads for ${user.email}. Are you sure?`
                              );
                              if (ans) {
                                rebuildAdsHandler(user.id);
                              }
                            }}
                          >
                            Rebuild All Ads
                          </MenuItem>
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
