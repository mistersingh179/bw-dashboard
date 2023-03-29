import React from "react";
import { useSession } from "next-auth/react";
import { Box, Heading } from "@chakra-ui/react";
import Settings from "@/pages/settings";
import FCWithAuth from "@/types/FCWithAuth";

const Reporting: FCWithAuth = () => {
  return <Heading mt={5}>Reporting</Heading>;
};

Reporting.auth = true;

export default Reporting;
