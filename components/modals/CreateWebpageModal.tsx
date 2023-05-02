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
import React, { useState } from "react";
import StatusBadge from "@/components/StatusBadge";
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
  const [html, setCorpus] = useState("");
  const [status, setStatus] = useState(false);

  const urlMissing = url.length === 0 ? true : false;

  return (
    <Modal isOpen={isOpen} onClose={onClose} size={"lg"}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Create Website Url</ModalHeader>
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
              <FormLabel>Corpus</FormLabel>
              <Textarea
                value={html}
                onChange={(evt) => setCorpus(evt.target.value)}
              />
              <FormHelperText>
                The content of this website. You can leave this blank as nightly
                background jobs will fetch it for you when they are blank.
              </FormHelperText>
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
                html,
                status,
              };
              onClose();
              await onSave(newWebpage);
              setUrl("https://acme.com");
              setCorpus("");
              setStatus(false);
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
