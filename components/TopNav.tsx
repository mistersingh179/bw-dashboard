import React from "react";
import {
  HStack,
  Heading,
  Spacer,
  Box,
  Text,
  Button,
  Avatar,
  Show,
} from "@chakra-ui/react";
import { Link, Image } from "@chakra-ui/next-js";
import { signIn, signOut, useSession } from "next-auth/react";
import { useRouter } from "next/router";

const TopNav: React.FC = () => {
  const { data: session, status } = useSession();
  console.log("session: ", session);
  const router = useRouter();
  const currentRoute = router.pathname;

  return (
    <>
      <HStack px={5} h={"50px"}>
        <HStack spacing={5} alignItems={"center"}>
          <Image
            position={"relative"}
            top={"-1px"}
            width={"150"}
            height={"22"}
            alt={"BrandWeaver.ai Logo"}
            src={"/BrandWeaver-Blue-Logo-small.png"}
          />
          <Show above={"sm"}>
            <Link
              href={"/dashboard"}
              fontWeight={currentRoute === "/dashboard" ? "bold" : "normal"}
            >
              Dashboard
            </Link>
            <Link
              href={"/campaigns/list"}
              fontWeight={
                currentRoute === "/campaigns/list" ? "bold" : "normal"
              }
            >
              Campaigns
            </Link>
            <Link
              href={"/websites/list"}
              fontWeight={currentRoute === "/websites/list" ? "bold" : "normal"}
            >
              Websites
            </Link>
            <Link
              href={"/javascriptSnippet"}
              fontWeight={
                currentRoute === "/javascriptSnippet" ? "bold" : "normal"
              }
            >
              JavaScript Snippet
            </Link>
            <Link
              href={"/settings"}
              fontWeight={currentRoute === "/settings" ? "bold" : "normal"}
            >
              Settings
            </Link>
            <Link
              href={"/categories/list"}
              fontWeight={currentRoute === "/categories/list" ? "bold" : "normal"}
            >
              Categories
            </Link>
          </Show>
        </HStack>
        <Spacer />
        <HStack spacing={5}>
          {!session && (
            <Button variant={"outline"} onClick={() => signIn("google")}>
              Sign In
            </Button>
          )}
          <Show above={"lg"}>
            {session?.user?.name && (
              <Text>Logged in as {session.user.name} </Text>
            )}
            {session?.user?.image && (
              <Avatar size={"sm"} src={session.user.image} />
            )}
          </Show>

          {session && (
            <Button
              variant={"outline"}
              onClick={() => signOut({ callbackUrl: "/" })}
            >
              Sign out
            </Button>
          )}
        </HStack>
      </HStack>
    </>
  );
};

export default TopNav;
