import Head from "next/head";
import Image from "next/image";
import { Inter } from "next/font/google";
import styles from "@/styles/Home.module.css";
//import Link from "next/link";
import { Link } from "@chakra-ui/next-js";
import { signIn, signOut, useSession } from "next-auth/react";
import React from "react";
import {
  Text,
  Box,
  Container,
  Heading,
  VStack,
  HStack,
  Button,
  Avatar,
  Show,
} from "@chakra-ui/react";

const Home: React.FC = () => {
  const { data: session } = useSession();
  return (
    <VStack justifyContent={"center"} h={"calc(100vh - 50px)"} spacing={5}>
      <Heading size={"xl"}>BrandWeaver.ai</Heading>
      <Text>
        AI Places Products Into Every Piece of{" "}
        <Show above={"sm"}>Publisher</Show>
        Content
      </Text>
      <HStack>
        {!session && (
          <Button
            onClick={() => signIn("google", { callbackUrl: "/dashboard" })}
          >
            Sign In
          </Button>
        )}
        {session && (
          <>
            <Avatar size={"sm"} src={session?.user?.image || undefined} />
            <Text>Logged in as {session?.user?.name} </Text>
            <Button onClick={() => signOut()} variant={"outline"}>
              Sign Out
            </Button>
          </>
        )}
      </HStack>
    </VStack>
  );
};

export default Home;
