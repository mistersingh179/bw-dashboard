import React from "react";
import { useSession } from "next-auth/react";
import {Box, Heading, Text, VStack} from "@chakra-ui/react";
import JavascriptSnippet from "@/pages/javascriptSnippet";
import FCWithAuth from "@/types/FCWithAuth";

const Reporting: FCWithAuth = () => {
  return (
    <Box>
      <Heading mt={5}>
        Reporting
      </Heading>
      <VStack h={"calc(100vh - 200px)"} justifyContent={'center'}>
        <Text fontSize={'4xl'}>Reporting is Coming soon</Text>
      </VStack>
    </Box>
  );
};

Reporting.auth = true;

export default Reporting;
