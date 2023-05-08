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
import {AddIcon} from "@chakra-ui/icons";
import React, {useState} from "react";
import {ErrorRow, LoadingDataRow, NoDataRow,} from "@/components/genericMessages";
import {NullableWebsiteType, WebsiteType} from "@/types/my-types";
import CreateWebsiteModal from "@/components/modals/CreateWebsiteModal";
import useWebsites from "@/hooks/useWebsites";
import {Link} from "@chakra-ui/next-js";
import EditWebsiteModal from "@/components/modals/EditWebsiteModal";

const Website = () => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const {
    isOpen: editModalIsOpen,
    onOpen: editModalOnOpen,
    onClose: editModalOnClose,
  } = useDisclosure();
  const { websites, isLoading, error, onSave, onUpdate } = useWebsites();
  const [websiteBeingEdited, setWebsiteBeingEdited] =
    useState<NullableWebsiteType>(undefined);

  return (
    <Box>
      <CreateWebsiteModal isOpen={isOpen} onClose={onClose} onSave={onSave} />
      {websiteBeingEdited && (
        <EditWebsiteModal
          isOpen={editModalIsOpen}
          onClose={editModalOnClose}
          onUpdate={onUpdate}
          website={websiteBeingEdited}
        />
      )}
      <HStack>
        <Heading my={5}>Websites</Heading>
        <Spacer />
        <Button onClick={onOpen} colorScheme={"blue"} leftIcon={<AddIcon />}>
          Add Website
        </Button>
      </HStack>
      <TableContainer>
        <Table variant="simple" colorScheme="gray" size={"md"}>
          <Thead>
            <Tr>
              <Th>Domain Url</Th>
              <Th>Sitemap Url</Th>
              <Th>Status</Th>
              <Th>Actions</Th>
            </Tr>
          </Thead>
          <Tbody>
            {error && <ErrorRow colSpan={4} />}
            {isLoading && <LoadingDataRow colSpan={4} />}
            {websites && websites.length == 0 && <NoDataRow colSpan={4} />}
            {websites &&
              websites.length > 0 &&
              websites.map((website: WebsiteType) => (
                <Tr key={website.id ?? JSON.stringify(website)}>
                  <Td>{website.topLevelDomainUrl}</Td>
                  <Td>{website.sitemapUrl}</Td>
                  <Td>
                    <Switch
                      isChecked={website.status}
                      isDisabled={website.id ? false : true}
                      onChange={(evt) =>
                        onUpdate({
                          ...website,
                          status: evt.target.checked,
                        })
                      }
                    />
                  </Td>
                  <Td>
                    <HStack>
                      <Link href={`/websites/${website.id}/webpages/list`}>
                        Webpages
                      </Link>
                      <Button size={'sm'}
                        onClick={() => {
                          setWebsiteBeingEdited(website);
                          editModalOnOpen();
                        }}
                      >
                        Edit
                      </Button>
                    </HStack>
                  </Td>
                </Tr>
              ))}
          </Tbody>
          {websites && websites.length > 0 && (
            <TableCaption>These are your sweet websites.</TableCaption>
          )}
        </Table>
      </TableContainer>
    </Box>
  );
};

export default Website;
