import React from "react";
import { useSession } from "next-auth/react";
import {Box, Heading} from "@chakra-ui/react";
import FCWithAuth from "@/types/FCWithAuth";

const Dashboard: FCWithAuth = () => {
  return <Heading mt={5}>Dashboard</Heading>
};

Dashboard.auth = true;

export default Dashboard;