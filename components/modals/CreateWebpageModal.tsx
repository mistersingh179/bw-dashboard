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
import { WebpageType } from "@/types/my-types";

const CreateWebpageModal = ({
  isOpen,
  onClose,
  onSave,
}: {
  isOpen: boolean;
  onClose: () => void;
  onSave: (newWebpage: WebpageType) => void;
}) => {
  const [url, setUrl] = useState("https://acme.com");
  const [status, setStatus] = useState(false);

  const urlMissing = url.trim() === '' ? true : false;

  return (
    <Modal isOpen={isOpen} onClose={onClose} size={"lg"}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Create Webpage</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <VStack spacing={5}>
            <FormControl isRequired isInvalid={urlMissing}>
              <FormLabel>Url</FormLabel>
              <Input
                type="text"
                value={url}
                onChange={(evt) => setUrl(evt.target.value)}
              />
              {!urlMissing && (
                <FormHelperText>This is the url of the webpage</FormHelperText>
              )}
              {urlMissing && (
                <FormErrorMessage>
                  This is a require field and thus you must provide a url
                </FormErrorMessage>
              )}
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
              const newWebpage: WebpageType = {
                url,
                status,
                lastModifiedAt: new Date(),
              };
              onClose();
              setUrl("https://acme.com");
              setStatus(false);
              await onSave(newWebpage);
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

export default CreateWebpageModal;
