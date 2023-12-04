import {
  Button,
  FormControl,
  FormErrorMessage,
  FormHelperText,
  FormLabel,
  HStack,
  Input,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Switch,
  VStack,
} from "@chakra-ui/react";
import React, { useState } from "react";
import { WebsiteType } from "@/types/my-types";

const dummyUrl =
  process.env.NODE_ENV === "development"
    ? "http://localhost:8000"
    : "https://YourWebsite.com";

const CreateWebsiteModal = ({
  isOpen,
  onClose,
  onSave,
}: {
  isOpen: boolean;
  onClose: () => void;
  onSave: (newWebsite: WebsiteType) => void;
}) => {
  const [topLevelDomainUrl, setTopLevelDomainUrl] =
    useState(dummyUrl);
  const [sitemapUrl, setSitemapUrl] = useState(`${dummyUrl}/sitemap.xml`);
  const [status, setStatus] = useState(false);
  const [adTag, setAdTag] = useState('');
  
  const topLevelDomainUrlMissing =
    topLevelDomainUrl.length === 0 ? true : false;

  const sitemapUrlMissing = sitemapUrl.length === 0 ? true : false;

  return (
    <Modal isOpen={isOpen} onClose={onClose} size={"lg"}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Create Website Url</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <VStack spacing={5}>
            <FormControl isRequired isInvalid={topLevelDomainUrlMissing}>
              <FormLabel>Url</FormLabel>
              <Input
                type="text"
                value={topLevelDomainUrl}
                onChange={(evt) => setTopLevelDomainUrl(evt.target.value)}
              />
              {!topLevelDomainUrlMissing && (
                <FormHelperText>This is the url AKA domain name of the website.</FormHelperText>
              )}
              <FormErrorMessage>
                This is a require field and thus you must provide a url
              </FormErrorMessage>
            </FormControl>
            <FormControl isRequired isInvalid={sitemapUrlMissing}>
              <FormLabel>Sitemap</FormLabel>
              <Input
                type="text"
                value={sitemapUrl}
                onChange={(evt) => setSitemapUrl(evt.target.value)}
              />
              <FormHelperText>This is the url to your sitemap.</FormHelperText>
              <FormErrorMessage>
                This is a require field. It is used for us to fetch the pages,
                posts etc. of your website & then build ads for them.
              </FormErrorMessage>
            </FormControl>
            <FormControl>
              <FormLabel>Ad Tag</FormLabel>
              <Input
                type="text"
                value={adTag}
                onChange={(evt) => setAdTag(evt.target.value)}
              />
              <FormHelperText>This is the the adTAg which will be loaded on this site.</FormHelperText>
            </FormControl>
            <FormControl>
              <HStack>
                <FormLabel mb="0">Status</FormLabel>
                <Switch
                  isChecked={status}
                  onChange={(evt) => setStatus(evt.target.checked)}
                />
              </HStack>
            </FormControl>
          </VStack>
        </ModalBody>

        <ModalFooter>
          <Button
            colorScheme="blue"
            mr={3}
            onClick={async () => {
              const newWebsite: WebsiteType = {
                topLevelDomainUrl,
                sitemapUrl,
                status,
                adTag,
                processedOn: null,
              };
              onClose();
              setTopLevelDomainUrl(dummyUrl);
              setSitemapUrl(`${dummyUrl}/sitemap.xml`);
              setStatus(false);
              setAdTag('');
              await onSave(newWebsite);
            }}
          >
            Save
          </Button>
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default CreateWebsiteModal;
