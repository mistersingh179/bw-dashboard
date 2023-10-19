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

  const processWebpages = async (id: string) => {
    const payload = {
      userIdToProcess: id,
    };
    const res = await fetch("/api/users/processWebpages", {
      method: "POST",
      body: JSON.stringify(payload),
      headers: {
        "Content-Type": "application/json",
      },
    });
    console.log("processWebpages result: ", res.status, res.statusText);
  };

  const rebuildMetaContentsHandler = async (id: string) => {
    const payload = {
      userIdToProcess: id,
    };
    const res = await fetch("/api/users/rebuildMetaContents", {
      method: "POST",
      body: JSON.stringify(payload),
      headers: {
        "Content-Type": "application/json",
      },
    });
    console.log("rebuildAds result: ", res.status, res.statusText);
  };

  const deleteAllAuctions = async (id: string) => {
    const payload = {
      userIdToProcess: id,
    };
    const res = await fetch("/api/users/deleteAllAuctions", {
      method: "POST",
      body: JSON.stringify(payload),
      headers: {
        "Content-Type": "application/json",
      },
    });
    console.log("deleteAllAuctions result: ", res.status, res.statusText);
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
              <Th>User</Th>
              <Th>Counts</Th>
              <Th>Actions</Th>
            </Tr>
          </Thead>
          <Tbody>
            {error && <ErrorRow colSpan={4} />}
            {isLoading && <LoadingDataRow colSpan={4} />}
            {!isLoading && users && users.length == 0 && (
              <NoDataRow colSpan={4} />
            )}
            {users &&
              users.length > 0 &&
              users.map((user: UserWithCounts) => (
                <Tr key={user.id}>
                  <Td>
                    <UnorderedList>
                      <ListItem>Name: {user.name}</ListItem>
                      <ListItem>Id: {user.id}</ListItem>
                      <ListItem>Email: {user.email}</ListItem>
                      <ListItem>
                        Websites:{" "}
                        {user.websites
                          .map((w) => w.topLevelDomainUrl)
                          .join(", ") || "none"}
                      </ListItem>
                    </UnorderedList>
                  </Td>
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
                                `Are you sure you want to PROCESS this user: ${user.email}?\n\n` +
                                  `This will download NEW webpages from the sitemap etc. and ` +
                                  `then process those webpages. ` +
                                  `Processing a webpage means that it will setup its ` +
                                  `content, title, description, ad spots, meta content spots & categories.\n\n` +
                                  `It does NOT process existing webpages.`
                              );
                              if (ans) {
                                processUserHandler(user.id);
                              }
                            }}
                          >
                            Process User (Fetches NEW webpages)
                          </MenuItem>
                          <MenuItem
                            onClick={() => {
                              const ans = confirm(
                                `This will process all EXISTING webpages for ${user.email}.\n\n` +
                                  `Processing a webpage means that it will setup their ` +
                                  `content, title, description, ad spots, meta content spots & categories.\n\n` +
                                  `It does NOT download new webpages from sitemap etc.`
                              );
                              if (ans) {
                                processWebpages(user.id);
                              }
                            }}
                          >
                            Process Webpages (Works on EXISTING webpages)
                          </MenuItem>
                          <MenuItem
                            onClick={() => {
                              const ans = confirm(
                                `This will DELETE ALL ad spots and ads for ${user.email}. ` +
                                  `It will also set related impressions to have reference id of null, ` +
                                  `but wont delete them. Are you sure?`
                              );
                              if (ans) {
                                rebuildAdsHandler(user.id);
                              }
                            }}
                          >
                            Rebuild All Ads
                          </MenuItem>
                          <MenuItem
                            onClick={() => {
                              const ans = confirm(
                                `This will DELETE ALL meta content spots and meta content for ${user.email}. ` +
                                  `It will also set related analytics to have reference id of null, but wont delete them. ` +
                                  `Are you sure?`
                              );
                              if (ans) {
                                rebuildMetaContentsHandler(user.id);
                              }
                            }}
                          >
                            Rebuild All Meta Contents
                          </MenuItem>
                          <MenuItem
                            onClick={() => {
                              const ans = confirm(
                                `This will DELETE ALL auctions & related impressions for ${user.email}. Are you sure?`
                              );
                              if (ans) {
                                deleteAllAuctions(user.id);
                              }
                            }}
                          >
                            Delete All Auctions
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
