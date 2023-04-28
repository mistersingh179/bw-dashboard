import FCWithAuth from "@/types/FCWithAuth";
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
  Text,
  useDisclosure,
} from "@chakra-ui/react";
import { AddIcon } from "@chakra-ui/icons";
import { format, parseISO } from "date-fns";
import StatusBadge from "@/components/StatusBadge";
import { Link } from "@chakra-ui/next-js";
import React from "react";
import { ErrorRow, LoadingDataRow, NoDataRow } from "@/components/genericRows";
import useSWR from "swr";
import fetcher from "@/helpers/fetcher";
import AnyObject from "@/types/AnyObject";
import CreateWebsiteUrlModal from "@/components/modals/CreateWebsiteUrlModal";
import { WebsiteUrlType } from "@/types/my-types";
import useTxToast from "@/hooks/useTxToast";
import { WebsiteUrl } from "@prisma/client";

const WebsiteUrls: FCWithAuth = () => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { success, failure } = useTxToast();
  const {
    data: websiteUrls,
    error,
    isLoading,
    mutate,
  } = useSWR<WebsiteUrlType[]>("/api/websiteUrls", fetcher);

  const onUpdate = async (
    updatedWebsiteUrl: WebsiteUrlType,
    evt: React.ChangeEvent<HTMLInputElement>
  ) => {
    updatedWebsiteUrl.status = evt.target.checked;
    console.log("updated website url is: ", updatedWebsiteUrl);
    try {
      await mutate(updateWebsiteUrl.bind(this, updatedWebsiteUrl), {
        optimisticData: (currentData) => {
          success("Website Url", "Updated successfully");
          if (currentData) {
            const newData = currentData.filter(
              (x) => x.id != updatedWebsiteUrl.id
            );
            return [...newData, updatedWebsiteUrl];
          } else {
            return [updatedWebsiteUrl];
          }
        },
        populateCache: false,
      });
    } catch (err) {
      console.log("error updating websiteUrl:", err);
      failure("Website Url", "rolling back as update failed");
    }
  };

  const onSave = async (newWebsiteUrl: WebsiteUrlType) => {
    console.log("going to save the website url: ", newWebsiteUrl);
    try {
      await mutate(saveWebsiteUrl.bind(this, newWebsiteUrl), {
        optimisticData: (currentData) => {
          success("Website Url", "Created successfully");
          if (currentData) {
            return [...currentData, newWebsiteUrl];
          } else {
            return [newWebsiteUrl];
          }
        },
        populateCache: false,
      });
    } catch (err) {
      console.log("website url creation failed: ", err);
      failure("Website Url", "Rolling back as creation failed!");
    }
  };

  const updateWebsiteUrl = async (updatedWebsiteUrl: WebsiteUrlType) => {
    const res = await fetch(`/api/websiteUrls/${updatedWebsiteUrl.id}`, {
      method: "PUT",
      body: JSON.stringify(updatedWebsiteUrl),
      headers: {
        "Content-Type": "application/json",
      },
    });
    console.log("res result: ", res.status);
    const data = await res.json();
    if (res.status >= 400) {
      throw new Error(data.message);
    } else {
      console.log("got updated website url: ", data);
      return data;
    }
  };

  const saveWebsiteUrl = async (newWebsiteUrl: WebsiteUrlType) => {
    onClose();
    const res = await fetch("/api/websiteUrls", {
      method: "POST",
      body: JSON.stringify(newWebsiteUrl),
      headers: {
        "Content-Type": "application/json",
      },
    });
    console.log("res result: ", res.status);
    const data = await res.json();
    if (res.status >= 400) {
      throw new Error(data.message);
    } else {
      console.log("got new website url: ", data);
      return data;
    }
  };

  return (
    <Box>
      <CreateWebsiteUrlModal
        isOpen={isOpen}
        onClose={onClose}
        onSave={onSave}
      />
      <HStack>
        <Heading my={5}>Website Urls</Heading>
        <Spacer />
        <Button onClick={onOpen} colorScheme={"blue"} leftIcon={<AddIcon />}>
          Add another Website Url
        </Button>
      </HStack>
      <TableContainer>
        <Table variant="simple" colorScheme="gray" size={"md"}>
          <Thead>
            <Tr>
              <Th>Url</Th>
              <Th>Corpus</Th>
              <Th>Status</Th>
            </Tr>
          </Thead>
          <Tbody>
            {error && <ErrorRow colSpan={3} />}
            {isLoading && <LoadingDataRow colSpan={3} />}
            {websiteUrls && websiteUrls.length == 0 && (
              <NoDataRow colSpan={3} />
            )}
            {websiteUrls &&
              websiteUrls.length > 0 &&
              websiteUrls.map((websiteUrl: WebsiteUrlType) => (
                <Tr key={websiteUrl.id ?? JSON.stringify(websiteUrl)}>
                  <Td>{websiteUrl.url}</Td>
                  <Td maxW={"lg"}>
                    <Text textOverflow={"ellipsis"} overflow={"clip"}>
                      {websiteUrl.corpus}
                    </Text>
                  </Td>
                  <Td>
                    <Switch
                      isChecked={websiteUrl.status}
                      isDisabled={websiteUrl.id ? false : true}
                      onChange={onUpdate.bind(this, websiteUrl)}
                    />
                  </Td>
                </Tr>
              ))}
          </Tbody>
          {websiteUrls && websiteUrls.length > 0 && (
            <TableCaption>These are your sweet websiteUrls.</TableCaption>
          )}
        </Table>
      </TableContainer>
    </Box>
  );
};

WebsiteUrls.auth = true;
export default WebsiteUrls;
