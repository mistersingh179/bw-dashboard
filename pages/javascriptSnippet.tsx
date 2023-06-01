import React, { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import {
  Text,
  Box,
  Heading,
  VStack,
  Code,
  Stack,
  Button,
  OrderedList,
  ListItem,
} from "@chakra-ui/react";
import FCWithAuth from "@/types/FCWithAuth";
import MyCode from "@/components/MyCode";
import superjson from "superjson";

const BW_SCRIPT_BASE_URL = process.env.NEXT_PUBLIC_BW_SCRIPT_BASE_URL;

const scriptTag = (userId: string) => {
  return `<!-- BrandWeaver tag (bw.js) -->
<script defer src="${BW_SCRIPT_BASE_URL}/bw.js?id=${userId}"></script>`;
};

const JavascriptSnippet: FCWithAuth = () => {
  const { data: session } = useSession();
  console.log(session);
  const [userId, setUserId] = useState("unknown");

  useEffect(() => {
    const getUser = async () => {
      const res = await fetch("/api/user");
      console.log("res result: ", res.status);
      const text = await res.text();
      const data = await superjson.parse<any>(text);
      console.log(data);
      setUserId(data.id);
    };
    if (session?.user?.email) {
      getUser();
    }
  }, [session?.user?.email]);

  return (
    <Box>
      <Heading mt={5}>Settings</Heading>
      <VStack spacing={7} alignItems={"start"}>
        <Heading size={"md"} mt={5}>
          JavaScript Snippet
        </Heading>
        <Text>
          Below is the BrandWeaver tag for this account. Copy and paste it in
          the code of every page of your website, immediately after the
          &lt;head&gt; element. Don’t add more than one BrandWeaver tag to each
          page.
        </Text>
        <MyCode> {scriptTag(userId)} </MyCode>
        <Heading size={"md"}>
          How to restrict BrandWeaver code from running on your website?
        </Heading>
        <Box>
          <Text mb={5}>
            Here are some ways you can use to limit BrandWeaver:
          </Text>
          <OrderedList spacing={2}>
            <ListItem>
              Don&apos;t include the script on the pages you don&apos;t want it
              to run on. If there is no script on the page, then there is no way
              BrandWeaver can run.
            </ListItem>
            <ListItem>
              Add meta tag: <MyCode>meta[bw-opt-out=&quot;true&quot;]</MyCode>{" "}
              to the pages you don&apos;t it to run. When brandweaver script
              loads it scans the page and if this meta tag is found it will
              abort itself.
            </ListItem>
            <ListItem>
              Turn the status off for the entire website on which you
              don&apos;t want brandweaver to run.
            </ListItem>
            <ListItem>
              Turn the status off for individual webpages on which you
              don&apos;t want brandweaver to run.
            </ListItem>
          </OrderedList>
        </Box>
      </VStack>
    </Box>
  );
};

JavascriptSnippet.auth = true;

export default JavascriptSnippet;
