import {useRouter} from "next/router";
import {QueryParams} from "@/types/QueryParams";
import {Box, Heading} from "@chakra-ui/react";
import React from "react";

const Show = () => {
  const router = useRouter();
  const { wsid, wpid } = router.query as QueryParams;

  return (
    <Box>
      <Heading my={5}>Webpage Details</Heading> <Heading size={'sm'}> / foobar.com</Heading>
    </Box>
  )
}

export default Show;