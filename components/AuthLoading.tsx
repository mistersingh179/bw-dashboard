import React from "react";
import {Center, Heading} from "@chakra-ui/react";

const AuthLoading: React.FC = () => {
  return (
    <Center justifyContent={"center"} h={"calc(100vh - 50px)"}>
      <Heading>Loading . . .</Heading>
    </Center>
  );
};

export default AuthLoading;
