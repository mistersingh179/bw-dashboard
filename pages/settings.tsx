import React, { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import {Text, Box, Heading, VStack, Code, Stack, Button} from "@chakra-ui/react";
import FCWithAuth from "@/types/FCWithAuth";

const scriptTag = (userId: string) => {
  return `<!-- BrandWeaver tag (bw.js) -->
<script defer src="https://assets.brandweaver.ai/bw.js?id=${userId}"></script>`
}

const Settings: FCWithAuth = () => {
  const { data: session } = useSession();
  console.log(session);
  const [userId, setUserId] = useState("unknown");

  useEffect(() => {
    const getUser = async () => {
      const res = await fetch("/api/user");
      const data = await res.json();
      console.log(data);
      setUserId(data.user.id);
    };
    if (session?.user?.email) {
      getUser();
    }
  }, [session?.user?.email]);

  return (
    <Box>
      <Heading mt={5}>Settings</Heading>
      <VStack spacing={5} alignItems={"start"}>
        <Heading size={"md"} mt={5}>
          JavaScript Snippet
        </Heading>
        <Text>
          Below is the BrandWeaver tag for this account. Copy and paste it in
          the code of every page of your website, immediately after the
          &lt;head&gt; element. Don’t add more than one BrandWeaver tag to each
          page.
        </Text>
        <Code
          _selection={{color: "gray.800", bg: 'orange.300'}}
          whiteSpace={"pre"}
          variant={"solid"}
          bg={"yellow.100"}
          color={"gray.700"}
          border={"1px"}
          borderColor={"gray.300"}
          boxShadow={"lg"}
          borderRadius={"lg"}
          p={5}
        >
          {scriptTag(userId)}
        </Code>
      </VStack>
    </Box>
  );
};

Settings.auth = true;

export default Settings;
