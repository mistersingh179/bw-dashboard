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
  Textarea,
  VStack,
} from "@chakra-ui/react";
import React, {useEffect, useState} from "react";
import StatusBadge from "@/components/StatusBadge";
import { NullableWebsiteType, WebsiteType } from "@/types/my-types";
import AnyObject from "@/types/AnyObject";

const EditWebsiteModal = ({
  isOpen,
  onClose,
  onUpdate,
  website,
}: {
  isOpen: boolean;
  onClose: () => void;
  onUpdate: (updatedWebsite: WebsiteType) => void;
  website: WebsiteType;
}) => {
  const [topLevelDomainUrl, setTopLevelDomainUrl] = useState("");
  const [sitemapUrl, setSitemapUrl] = useState("");
  const [status, setStatus] = useState(false);

  const topLevelDomainUrlMissing =
    topLevelDomainUrl.length === 0 ? true : false;

  const sitemapUrlMissing = sitemapUrl.length === 0 ? true : false;

  useEffect(() => {
    setTopLevelDomainUrl(website.topLevelDomainUrl);
    setSitemapUrl(website.sitemapUrl);
    setStatus(website.status);
  }, [website])

  return (
    <Modal isOpen={isOpen} onClose={onClose} size={"lg"}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>
          Update Website Url {website?.topLevelDomainUrl ?? "not yet"}
        </ModalHeader>
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
                <FormHelperText>This is the url of the webpage</FormHelperText>
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
              const updatedWebsite: WebsiteType = {
                ...website,
                topLevelDomainUrl,
                sitemapUrl,
                status,
              };
              onClose();
              await onUpdate(updatedWebsite);
            }}
          >
            Update
          </Button>
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default EditWebsiteModal;
