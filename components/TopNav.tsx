import React from "react";
import {
  HStack,
  Heading,
  Spacer,
  Box,
  Text,
  Button,
  Avatar,
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
            width={"150"}
            height={"22"}
            alt={"BrandWeaver.ai Logo"}
            src={"/BrandWeaver-Blue-Logo-small.png"}
          />
          <Link
            href={"/dashboard"}
            fontWeight={currentRoute === "/dashboard" ? "bold" : "normal"}
          >
            Dashboard
          </Link>
          <Link
            href={"/reporting"}
            fontWeight={currentRoute === "/reporting" ? "bold" : "normal"}
          >
            Reporting
          </Link>
          <Link
            href={"/settings"}
            fontWeight={currentRoute === "/settings" ? "bold" : "normal"}
          >
            Settings
          </Link>
        </HStack>
        <Spacer />
        <HStack spacing={5}>
          {!session && (
            <Button variant={"outline"} onClick={() => signIn("google")}>
              Sign In
            </Button>
          )}
          {session?.user?.name && (
            <Text>Logged in as {session.user.name} </Text>
          )}
          {session?.user?.image && (
            <Avatar size={"sm"} src={session.user.image} />
          )}

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
